import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from './services/wgerApi';
import { renderApp, sampleCategories, sampleExercises, sampleMuscles, signInAs } from './test/utils';

beforeEach(() => {
  vi.spyOn(api, 'fetchExercises').mockResolvedValue({ count: 3, next: null, exercises: sampleExercises });
  vi.spyOn(api, 'fetchCategories').mockResolvedValue(sampleCategories);
  vi.spyOn(api, 'fetchMuscles').mockResolvedValue(sampleMuscles);
  vi.spyOn(api, 'fetchExerciseImages').mockResolvedValue([]);
});

describe('Routing', () => {
  it('renders the home page with guest navigation', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/know what you lifted/i);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Log in');
    expect(nav).not.toHaveTextContent('My Workouts');
  });

  it('shows the 404 page for unknown URLs', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('redirects guests from protected routes to login', () => {
    renderApp('/workouts');
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('sends members away from the coach dashboard', () => {
    signInAs('member');
    renderApp('/coach');
    expect(screen.getByRole('heading', { name: 'My Workouts' })).toBeInTheDocument();
  });

  it('navigates between pages using navbar links', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('link', { name: 'Exercises' }));
    expect(await screen.findByRole('heading', { name: 'Exercise Library' })).toBeInTheDocument();
  });
});

describe('Login flow', () => {
  it('shows an error for bad credentials', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Email'), 'member@gymlog.test');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('logs in and updates the navbar through AuthContext', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Email'), 'coach@gymlog.test');
    await user.type(screen.getByLabelText('Password'), 'coach123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { name: 'My Workouts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Coach' })).toBeInTheDocument();
    expect(screen.getByText('Carlos Coach')).toBeInTheDocument();
  });
});

describe('Exercise library (API data + local state)', () => {
  it('shows a loading state, then the exercises from the API', async () => {
    renderApp('/exercises');
    expect(screen.getByRole('status')).toHaveTextContent(/loading exercises/i);
    expect(await screen.findByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText(/showing 3 of 3/i)).toBeInTheDocument();
  });

  it('filters by search text and category', async () => {
    const user = userEvent.setup();
    renderApp('/exercises');
    await screen.findByText('Bench Press');

    await user.type(screen.getByRole('searchbox', { name: /search exercises/i }), 'bench');
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: /search exercises/i }));
    await user.click(screen.getByRole('button', { name: 'Legs' }));
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry button when the API fails', async () => {
    api.fetchExercises.mockRejectedValueOnce(new Error('wger API request failed (500)'));
    const user = userEvent.setup();
    renderApp('/exercises');

    expect(await screen.findByRole('alert')).toHaveTextContent('500');
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Bench Press')).toBeInTheDocument();
  });

  it('adds an exercise to the workout via context and updates the navbar badge', async () => {
    signInAs('member');
    const user = userEvent.setup();
    renderApp('/exercises');
    await screen.findByText('Bench Press');

    const [firstAdd] = screen.getAllByRole('button', { name: '+ Add to Workout' });
    await user.click(firstAdd);

    expect(screen.getByRole('button', { name: '✓ Added' })).toBeInTheDocument();
    expect(screen.getByLabelText('1 in current workout')).toBeInTheDocument();
  });
});

describe('Exercise detail', () => {
  it('fetches an exercise by id when it is not cached yet', async () => {
    vi.spyOn(api, 'fetchExercise').mockResolvedValue(sampleExercises[1]);
    renderApp('/exercises/2');
    expect(await screen.findByRole('heading', { name: 'Squat' })).toBeInTheDocument();
    expect(api.fetchExercise).toHaveBeenCalledWith('2');
    expect(screen.getByText('Quads')).toBeInTheDocument();
  });

  it('shows an error for an exercise that does not exist', async () => {
    vi.spyOn(api, 'fetchExercise').mockRejectedValue(new Error('wger API request failed (404)'));
    renderApp('/exercises/999999');
    expect(await screen.findByRole('alert')).toHaveTextContent('Exercise not found');
  });
});

describe('Workouts end to end', () => {
  it('saves a workout and logs a session with sets, reps and weight', async () => {
    signInAs('member');
    const user = userEvent.setup();
    renderApp('/exercises');
    await screen.findByText('Bench Press');
    await user.click(screen.getAllByRole('button', { name: '+ Add to Workout' })[0]);

    await user.click(screen.getByRole('link', { name: /my workouts/i }));
    await user.type(screen.getByLabelText('Workout name'), 'Push Day');
    await user.click(screen.getByRole('button', { name: 'Save workout' }));

    await user.click(screen.getByRole('link', { name: /open & log/i }));
    expect(screen.getByRole('heading', { name: 'Push Day' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Bench Press Sets'), '3');
    await user.type(screen.getByLabelText('Bench Press Reps'), '8');
    await user.type(screen.getByLabelText('Bench Press Weight (kg)'), '60');
    await user.click(screen.getByRole('button', { name: 'Save session' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Session saved — 1 exercise logged.')
    );
    expect(screen.getByText('Bench Press: 3×8 @ 60 kg')).toBeInTheDocument();
    expect(screen.getByText('Last: 3×8 @ 60 kg')).toBeInTheDocument();
  });
});

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import AppProviders from '../contexts/AppProviders';

/** Signs a demo user in by writing the session the AuthProvider reads on mount. */
export function signInAs(role = 'member') {
  const user =
    role === 'coach'
      ? { name: 'Carlos Coach', email: 'coach@gymlog.test', role: 'coach' }
      : { name: 'Maya Member', email: 'member@gymlog.test', role: 'member' };
  window.localStorage.setItem('gymlog.session', JSON.stringify(user));
  return user;
}

/** Renders the whole app (providers + routes) at a given URL. */
export function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>
  );
}

/** Renders any element inside the real providers and a router. */
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>{ui}</AppProviders>
    </MemoryRouter>
  );
}

export const sampleExercises = [
  {
    id: 1,
    name: 'Bench Press',
    description: 'Press the bar.',
    category: 'Chest',
    categoryId: 11,
    muscles: ['Chest'],
    secondaryMuscles: ['Triceps'],
    muscleIds: [4, 5],
    equipment: ['Barbell'],
    images: [],
    imageUrl: null,
  },
  {
    id: 2,
    name: 'Squat',
    description: 'Sit down and stand up.',
    category: 'Legs',
    categoryId: 9,
    muscles: ['Quads'],
    secondaryMuscles: ['Glutes'],
    muscleIds: [10, 8],
    equipment: ['Barbell'],
    images: [],
    imageUrl: null,
  },
  {
    id: 3,
    name: 'Bicep Curl',
    description: 'Curl it.',
    category: 'Arms',
    categoryId: 8,
    muscles: ['Biceps'],
    secondaryMuscles: [],
    muscleIds: [1],
    equipment: ['Dumbbell'],
    images: [],
    imageUrl: null,
  },
];

export const sampleCategories = [
  { id: 8, name: 'Arms' },
  { id: 11, name: 'Chest' },
  { id: 9, name: 'Legs' },
];

export const sampleMuscles = [
  { id: 1, name: 'Biceps' },
  { id: 4, name: 'Chest' },
  { id: 10, name: 'Quads' },
];

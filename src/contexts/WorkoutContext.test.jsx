import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './AuthContext';
import { initialWorkoutState, useWorkouts, workoutReducer, WorkoutProvider } from './WorkoutContext';
import { sampleExercises, signInAs } from '../test/utils';

const [bench, squat] = sampleExercises;

describe('workoutReducer', () => {
  it('adds an exercise to a user draft without mutating previous state', () => {
    const frozen = Object.freeze({ ...initialWorkoutState, drafts: Object.freeze({}) });
    const next = workoutReducer(frozen, { type: 'ADD_EXERCISE', email: 'a@b.c', exercise: bench });
    expect(next.drafts['a@b.c']).toEqual([{ exerciseId: 1, name: 'Bench Press', category: 'Chest' }]);
    expect(frozen.drafts['a@b.c']).toBeUndefined();
    expect(next).not.toBe(frozen);
  });

  it('ignores duplicate exercises in the draft', () => {
    const once = workoutReducer(initialWorkoutState, { type: 'ADD_EXERCISE', email: 'x', exercise: bench });
    const twice = workoutReducer(once, { type: 'ADD_EXERCISE', email: 'x', exercise: bench });
    expect(twice).toBe(once);
  });

  it('logs a session onto the right workout only', () => {
    const state = {
      ...initialWorkoutState,
      workouts: [
        { id: 'w1', logs: [] },
        { id: 'w2', logs: [] },
      ],
    };
    const session = { id: 's1', date: '2026-01-01', entries: [] };
    const next = workoutReducer(state, { type: 'LOG_SESSION', id: 'w2', session });
    expect(next.workouts[1].logs).toEqual([session]);
    expect(next.workouts[0]).toBe(state.workouts[0]);
    expect(state.workouts[1].logs).toEqual([]);
  });
});

describe('WorkoutContext', () => {
  const wrapper = ({ children }) => (
    <AuthProvider>
      <WorkoutProvider>{children}</WorkoutProvider>
    </AuthProvider>
  );

  it('builds a draft, saves it as a workout, and logs a session', () => {
    signInAs('member');
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => result.current.addExercise(bench));
    act(() => result.current.addExercise(squat));
    expect(result.current.draft).toHaveLength(2);
    expect(result.current.isInDraft(1)).toBe(true);

    act(() => result.current.removeExercise(2));
    expect(result.current.draft.map((e) => e.name)).toEqual(['Bench Press']);

    let saved;
    act(() => {
      saved = result.current.saveDraft('Push Day');
    });
    expect(result.current.draft).toEqual([]);
    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0]).toMatchObject({ name: 'Push Day', ownerEmail: 'member@gymlog.test' });

    act(() => result.current.logSet(saved.id, [{ exerciseId: 1, sets: 3, reps: 8, weight: 60 }]));
    expect(result.current.getWorkoutById(saved.id).logs).toHaveLength(1);
  });

  it('lets a coach assign their draft as a plan to a member', () => {
    signInAs('coach');
    const { result } = renderHook(() => useWorkouts(), { wrapper });

    act(() => result.current.addExercise(squat));
    act(() => {
      result.current.assignPlan({ memberEmail: 'member@gymlog.test', name: 'Leg Day' });
    });

    expect(result.current.workouts).toHaveLength(0); // not in the coach's own list
    expect(result.current.allWorkouts[0]).toMatchObject({
      name: 'Leg Day',
      ownerEmail: 'member@gymlog.test',
      assignedBy: 'Carlos Coach',
    });
  });
});

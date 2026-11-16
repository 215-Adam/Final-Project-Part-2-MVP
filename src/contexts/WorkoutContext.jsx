import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { createId, loadState, saveState } from '../utils/storage';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'gymlog.workouts';

const WorkoutContext = createContext(null);

export const initialWorkoutState = { workouts: [], drafts: {} };

/**
 * Pure reducer: every case returns new objects/arrays so state is never mutated.
 * - workouts: all saved workouts, each with an ownerEmail
 * - drafts:   the workout currently being built, keyed by user email
 */
export function workoutReducer(state, action) {
  switch (action.type) {
    case 'ADD_EXERCISE': {
      const { email, exercise } = action;
      const draft = state.drafts[email] || [];
      if (draft.some((e) => e.exerciseId === exercise.id)) return state;
      const item = { exerciseId: exercise.id, name: exercise.name, category: exercise.category };
      return { ...state, drafts: { ...state.drafts, [email]: [...draft, item] } };
    }
    case 'REMOVE_EXERCISE': {
      const draft = state.drafts[action.email] || [];
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.email]: draft.filter((e) => e.exerciseId !== action.exerciseId),
        },
      };
    }
    case 'CLEAR_DRAFT':
      return { ...state, drafts: { ...state.drafts, [action.email]: [] } };
    case 'SAVE_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.workout] };
    case 'DELETE_WORKOUT':
      return { ...state, workouts: state.workouts.filter((w) => w.id !== action.id) };
    case 'LOG_SESSION':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.id ? { ...w, logs: [...w.logs, action.session] } : w
        ),
      };
    default:
      return state;
  }
}

export function WorkoutProvider({ children, initialState }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    workoutReducer,
    initialState,
    (init) => init || loadState(STORAGE_KEY, initialWorkoutState)
  );

  useEffect(() => saveState(STORAGE_KEY, state), [state]);

  const email = user ? user.email : null;

  const value = useMemo(() => {
    const draft = (email && state.drafts[email]) || [];
    const myWorkouts = email ? state.workouts.filter((w) => w.ownerEmail === email) : [];

    const buildWorkout = ({ name, exercises, ownerEmail, assignedBy = null }) => ({
      id: createId('w'),
      name: name.trim() || 'Untitled workout',
      ownerEmail,
      assignedBy,
      createdAt: new Date().toISOString(),
      exercises,
      logs: [],
    });

    return {
      draft,
      workouts: myWorkouts,
      allWorkouts: state.workouts,
      addExercise: (exercise) => email && dispatch({ type: 'ADD_EXERCISE', email, exercise }),
      removeExercise: (exerciseId) =>
        email && dispatch({ type: 'REMOVE_EXERCISE', email, exerciseId }),
      clearDraft: () => email && dispatch({ type: 'CLEAR_DRAFT', email }),
      isInDraft: (exerciseId) => draft.some((e) => e.exerciseId === exerciseId),
      saveDraft: (name) => {
        if (!email || draft.length === 0) return null;
        const workout = buildWorkout({ name, exercises: draft, ownerEmail: email });
        dispatch({ type: 'SAVE_WORKOUT', workout });
        dispatch({ type: 'CLEAR_DRAFT', email });
        return workout;
      },
      deleteWorkout: (id) => dispatch({ type: 'DELETE_WORKOUT', id }),
      getWorkoutById: (id) => state.workouts.find((w) => w.id === id) || null,
      logSet: (workoutId, entries) =>
        dispatch({
          type: 'LOG_SESSION',
          id: workoutId,
          session: { id: createId('s'), date: new Date().toISOString(), entries },
        }),
      assignPlan: ({ memberEmail, name }) => {
        if (!email || draft.length === 0) return null;
        const workout = buildWorkout({
          name,
          exercises: draft,
          ownerEmail: memberEmail,
          assignedBy: user.name,
        });
        dispatch({ type: 'SAVE_WORKOUT', workout });
        dispatch({ type: 'CLEAR_DRAFT', email });
        return workout;
      },
    };
  }, [state, email, user]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkouts must be used inside a WorkoutProvider');
  return context;
}

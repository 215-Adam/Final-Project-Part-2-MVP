import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { fetchCategories, fetchExercises, fetchMuscles } from '../services/wgerApi';

const ExerciseContext = createContext(null);

/**
 * Caches the wger exercise list, categories and muscles after the first fetch
 * so switching pages does not hit the API again.
 */
export function ExerciseProvider({ children }) {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const inFlight = useRef(null);
  const loaded = useRef(false);

  const loadExercises = useCallback(
    ({ force = false } = {}) => {
      if (inFlight.current) return inFlight.current;
      if (loaded.current && !force) return Promise.resolve();
      setStatus('loading');
      setError(null);
      inFlight.current = Promise.all([fetchExercises(), fetchCategories(), fetchMuscles()])
        .then(([exerciseData, categoryData, muscleData]) => {
          setExercises(exerciseData.exercises);
          setCategories(categoryData);
          setMuscles(muscleData);
          loaded.current = true;
          setStatus('success');
        })
        .catch((err) => {
          setError(err.message || 'Could not load exercises');
          setStatus('error');
        })
        .finally(() => {
          inFlight.current = null;
        });
      return inFlight.current;
    },
    []
  );

  const getExerciseById = useCallback(
    (id) => exercises.find((exercise) => exercise.id === Number(id)) || null,
    [exercises]
  );

  const value = useMemo(
    () => ({ exercises, categories, muscles, status, error, loadExercises, getExerciseById }),
    [exercises, categories, muscles, status, error, loadExercises, getExerciseById]
  );

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>;
}

export function useExercises() {
  const context = useContext(ExerciseContext);
  if (!context) throw new Error('useExercises must be used inside an ExerciseProvider');
  return context;
}

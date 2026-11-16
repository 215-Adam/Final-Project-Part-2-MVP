import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { fetchCategories, fetchExercises, fetchMuscles } from '../services/wgerApi';

export const BATCH_SIZE = 200;

const ExerciseContext = createContext(null);

/**
 * Caches the wger exercise list, categories and muscles after the first fetch
 * so switching pages does not hit the API again. More exercises are fetched
 * in batches on demand (the full list is ~7 MB, too slow to load at once).
 */
export function ExerciseProvider({ children }) {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const inFlight = useRef(null);
  const loaded = useRef(false);
  const nextOffset = useRef(0);

  const loadExercises = useCallback(({ force = false } = {}) => {
    if (inFlight.current) return inFlight.current;
    if (loaded.current && !force) return Promise.resolve();
    setStatus('loading');
    setError(null);
    inFlight.current = Promise.all([
      fetchExercises({ limit: BATCH_SIZE, offset: 0 }),
      fetchCategories(),
      fetchMuscles(),
    ])
      .then(([exerciseData, categoryData, muscleData]) => {
        setExercises(exerciseData.exercises);
        setCategories(categoryData);
        setMuscles(muscleData);
        nextOffset.current = BATCH_SIZE;
        setHasMore(Boolean(exerciseData.next));
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
  }, []);

  const loadMore = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    setLoadingMore(true);
    setError(null);
    inFlight.current = fetchExercises({ limit: BATCH_SIZE, offset: nextOffset.current })
      .then((data) => {
        setExercises((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          return [...prev, ...data.exercises.filter((e) => !seen.has(e.id))];
        });
        nextOffset.current += BATCH_SIZE;
        setHasMore(Boolean(data.next));
      })
      .catch((err) => setError(err.message || 'Could not load more exercises'))
      .finally(() => {
        inFlight.current = null;
        setLoadingMore(false);
      });
    return inFlight.current;
  }, []);

  const getExerciseById = useCallback(
    (id) => exercises.find((exercise) => exercise.id === Number(id)) || null,
    [exercises]
  );

  const value = useMemo(
    () => ({
      exercises,
      categories,
      muscles,
      status,
      error,
      hasMore,
      loadingMore,
      loadExercises,
      loadMore,
      getExerciseById,
    }),
    [exercises, categories, muscles, status, error, hasMore, loadingMore, loadExercises, loadMore, getExerciseById]
  );

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>;
}

export function useExercises() {
  const context = useContext(ExerciseContext);
  if (!context) throw new Error('useExercises must be used inside an ExerciseProvider');
  return context;
}

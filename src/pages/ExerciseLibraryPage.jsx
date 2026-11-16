import { useEffect, useMemo, useState } from 'react';
import { useExercises } from '../contexts/ExerciseContext';
import ExerciseCard from '../components/ExerciseCard';
import FilterBar from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorMessage, LoadingSpinner } from '../components/StatusMessage';
import { filterExercises } from '../utils/exercise';

const PAGE_SIZE = 24;

function ExerciseLibraryPage() {
  const { exercises, categories, muscles, status, error, loadExercises } = useExercises();
  // Local UI state: only this page cares about it.
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [muscleId, setMuscleId] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const filtered = useMemo(
    () => filterExercises(exercises, { search, categoryId, muscleId }),
    [exercises, search, categoryId, muscleId]
  );

  const withReset = (setter) => (value) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <PageHeader
        title="Exercise Library"
        subtitle="Powered by the open wger exercise database"
      />

      {status === 'error' && (
        <ErrorMessage message={error} onRetry={() => loadExercises({ force: true })} />
      )}
      {(status === 'loading' || status === 'idle') && <LoadingSpinner label="Loading exercises…" />}

      {status === 'success' && (
        <>
          <FilterBar
            search={search}
            onSearchChange={withReset(setSearch)}
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={withReset(setCategoryId)}
            muscles={muscles}
            muscleId={muscleId}
            onMuscleChange={withReset(setMuscleId)}
          />
          <p className="result-count" aria-live="polite">
            Showing {Math.min(visible, filtered.length)} of {filtered.length} exercises
          </p>
          {filtered.length === 0 ? (
            <EmptyState title="No exercises match">
              <p>Try a different search or clear the filters.</p>
            </EmptyState>
          ) : (
            <div className="grid">
              {filtered.slice(0, visible).map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          )}
          {visible < filtered.length && (
            <div className="load-more">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExerciseLibraryPage;

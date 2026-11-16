import { Link } from 'react-router-dom';
import { useWorkouts } from '../contexts/WorkoutContext';
import Card from './Card';

/**
 * Shows the workout currently being built (from WorkoutContext).
 * The parent decides what happens on save through the `footer` render prop/children.
 */
function DraftWorkout({ title = 'Current workout', children }) {
  const { draft, removeExercise } = useWorkouts();

  return (
    <Card title={title} className="draft">
      {draft.length === 0 ? (
        <p className="muted">
          No exercises yet. <Link to="/exercises">Browse the library</Link> and tap “Add to
          Workout”.
        </p>
      ) : (
        <>
          <ul className="draft__list">
            {draft.map((item) => (
              <li key={item.exerciseId} className="draft__item">
                <Link to={`/exercises/${item.exerciseId}`}>{item.name}</Link>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeExercise(item.exerciseId)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {children}
        </>
      )}
    </Card>
  );
}

export default DraftWorkout;

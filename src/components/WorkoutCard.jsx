import { Link } from 'react-router-dom';
import { formatDate } from '../utils/storage';

function WorkoutCard({ workout, onDelete }) {
  const lastLog = workout.logs[workout.logs.length - 1];
  return (
    <article className="workout-card">
      <div className="workout-card__top">
        <h3 className="workout-card__title">
          <Link to={`/workouts/${workout.id}`}>{workout.name}</Link>
        </h3>
        {workout.assignedBy && <span className="chip chip--accent">From {workout.assignedBy}</span>}
      </div>
      <p className="workout-card__meta">
        {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'} ·{' '}
        {workout.logs.length} session{workout.logs.length === 1 ? '' : 's'} logged
        {lastLog && <> · last {formatDate(lastLog.date)}</>}
      </p>
      <div className="workout-card__actions">
        <Link to={`/workouts/${workout.id}`} className="btn btn--primary btn--sm">
          Open &amp; log
        </Link>
        {onDelete && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onDelete(workout.id)}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default WorkoutCard;

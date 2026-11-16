import { Link } from 'react-router-dom';
import AddToWorkoutButton from './AddToWorkoutButton';

function ExerciseCard({ exercise }) {
  const muscles = exercise.muscles.length ? exercise.muscles.join(', ') : 'General';
  return (
    <article className="exercise-card">
      <Link to={`/exercises/${exercise.id}`} className="exercise-card__media">
        {exercise.imageUrl ? (
          <img src={exercise.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="exercise-card__placeholder" aria-hidden="true">
            {exercise.name.charAt(0)}
          </span>
        )}
      </Link>
      <div className="exercise-card__body">
        <span className="chip">{exercise.category}</span>
        <h3 className="exercise-card__title">
          <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
        </h3>
        <p className="exercise-card__meta">{muscles}</p>
        <AddToWorkoutButton exercise={exercise} size="sm" />
      </div>
    </article>
  );
}

export default ExerciseCard;

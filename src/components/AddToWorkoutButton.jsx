import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../contexts/WorkoutContext';
import Button from './Button';

/** Adds an exercise to the current draft workout via WorkoutContext (no prop drilling). */
function AddToWorkoutButton({ exercise, size }) {
  const { user } = useAuth();
  const { addExercise, removeExercise, isInDraft } = useWorkouts();

  if (!user) {
    return (
      <Link to="/login" className={`btn btn--secondary ${size ? `btn--${size}` : ''}`}>
        Log in to add
      </Link>
    );
  }

  const added = isInDraft(exercise.id);
  return (
    <Button
      variant={added ? 'secondary' : 'primary'}
      size={size}
      aria-pressed={added}
      onClick={() => (added ? removeExercise(exercise.id) : addExercise(exercise))}
    >
      {added ? '✓ Added' : '+ Add to Workout'}
    </Button>
  );
}

export default AddToWorkoutButton;

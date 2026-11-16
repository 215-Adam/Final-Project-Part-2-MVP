import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../contexts/WorkoutContext';
import Button from '../components/Button';
import DraftWorkout from '../components/DraftWorkout';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import WorkoutCard from '../components/WorkoutCard';
import { EmptyState } from '../components/StatusMessage';

function MyWorkoutsPage() {
  const { user } = useAuth();
  const { workouts, saveDraft, deleteWorkout } = useWorkouts();
  const [name, setName] = useState('');

  const assigned = workouts.filter((w) => w.assignedBy);
  const own = workouts.filter((w) => !w.assignedBy);

  const handleSave = (event) => {
    event.preventDefault();
    if (saveDraft(name)) setName('');
  };

  return (
    <div>
      <PageHeader title="My Workouts" subtitle={`Welcome back, ${user.name.split(' ')[0]}`} />

      <div className="two-col">
        <div className="two-col__side">
          <DraftWorkout title="Build a workout">
            <form onSubmit={handleSave}>
              <FormField
                label="Workout name"
                placeholder="e.g. Push Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button type="submit" className="btn--block">
                Save workout
              </Button>
            </form>
          </DraftWorkout>
        </div>

        <div className="two-col__main">
          {assigned.length > 0 && (
            <section className="section">
              <h2 className="section__title">Plans from your coach</h2>
              <div className="stack">
                {assigned.map((w) => (
                  <WorkoutCard key={w.id} workout={w} />
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section__title">Saved workouts</h2>
            {own.length === 0 ? (
              <EmptyState title="No saved workouts yet">
                <p>Add exercises from the library, name your workout, and save it.</p>
              </EmptyState>
            ) : (
              <div className="stack">
                {own.map((w) => (
                  <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default MyWorkoutsPage;

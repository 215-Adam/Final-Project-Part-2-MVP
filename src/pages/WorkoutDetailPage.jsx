import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../contexts/WorkoutContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { EmptyState } from '../components/StatusMessage';
import { formatDate } from '../utils/storage';

const blankEntry = () => ({ sets: '', reps: '', weight: '' });

function lastEntryFor(workout, exerciseId) {
  for (let i = workout.logs.length - 1; i >= 0; i -= 1) {
    const entry = workout.logs[i].entries.find((e) => e.exerciseId === exerciseId);
    if (entry) return entry;
  }
  return null;
}

function WorkoutDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getWorkoutById, logSet } = useWorkouts();
  const workout = getWorkoutById(id);

  // Inputs stay local until the user hits Save.
  const [inputs, setInputs] = useState({});
  const [message, setMessage] = useState('');

  const canView = workout && (workout.ownerEmail === user.email || user.role === 'coach');
  if (!canView) {
    return (
      <EmptyState title="Workout not found">
        <p>
          It may have been deleted. <Link to="/workouts">Back to My Workouts</Link>
        </p>
      </EmptyState>
    );
  }

  const isOwner = workout.ownerEmail === user.email;
  const valueFor = (exerciseId) => inputs[exerciseId] || blankEntry();

  const handleChange = (exerciseId, field) => (event) => {
    const { value } = event.target;
    setInputs((prev) => ({
      ...prev,
      [exerciseId]: { ...(prev[exerciseId] || blankEntry()), [field]: value },
    }));
    setMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const entries = workout.exercises
      .map((ex) => {
        const v = valueFor(ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: Number(v.sets),
          reps: Number(v.reps),
          weight: Number(v.weight) || 0,
        };
      })
      .filter((e) => e.sets > 0 && e.reps > 0);

    if (entries.length === 0) {
      setMessage('Enter sets and reps for at least one exercise.');
      return;
    }
    logSet(workout.id, entries);
    setInputs({});
    setMessage(`Session saved — ${entries.length} exercise${entries.length === 1 ? '' : 's'} logged.`);
  };

  return (
    <div>
      <Link to="/workouts" className="back-link">← My Workouts</Link>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">{workout.name}</h1>
          {workout.assignedBy && (
            <p className="page-header__subtitle">Plan assigned by {workout.assignedBy}</p>
          )}
        </div>
      </div>

      <div className="two-col">
        <div className="two-col__main">
          <Card title="Log today's session">
            <form onSubmit={handleSubmit}>
              <ul className="log-list">
                {workout.exercises.map((ex) => {
                  const last = lastEntryFor(workout, ex.exerciseId);
                  const v = valueFor(ex.exerciseId);
                  return (
                    <li key={ex.exerciseId} className="log-row">
                      <div className="log-row__head">
                        <Link to={`/exercises/${ex.exerciseId}`} className="log-row__name">
                          {ex.name}
                        </Link>
                        {last && (
                          <span className="log-row__last">
                            Last: {last.sets}×{last.reps} @ {last.weight} kg
                          </span>
                        )}
                      </div>
                      <div className="log-row__inputs">
                        {[
                          ['sets', 'Sets'],
                          ['reps', 'Reps'],
                          ['weight', 'Weight (kg)'],
                        ].map(([field, label]) => (
                          <label key={field} className="mini-field">
                            <span>{label}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step={field === 'weight' ? '0.5' : '1'}
                              aria-label={`${ex.name} ${label}`}
                              value={v[field]}
                              onChange={handleChange(ex.exerciseId, field)}
                              disabled={!isOwner}
                            />
                          </label>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {message && (
                <p className="form-message" role="status">
                  {message}
                </p>
              )}
              {isOwner && (
                <Button type="submit" className="btn--block">
                  Save session
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="two-col__side">
          <Card title="History">
            {workout.logs.length === 0 ? (
              <p className="muted">No sessions logged yet.</p>
            ) : (
              <ol className="history">
                {[...workout.logs].reverse().map((session) => (
                  <li key={session.id} className="history__item">
                    <strong>{formatDate(session.date)}</strong>
                    <ul>
                      {session.entries.map((e) => (
                        <li key={e.exerciseId}>
                          {e.name}: {e.sets}×{e.reps} @ {e.weight} kg
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetailPage;

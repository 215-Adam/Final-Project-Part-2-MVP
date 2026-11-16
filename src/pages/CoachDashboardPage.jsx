import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../contexts/WorkoutContext';
import Button from '../components/Button';
import Card from '../components/Card';
import DraftWorkout from '../components/DraftWorkout';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/StatusMessage';
import { formatDate } from '../utils/storage';

function CoachDashboardPage() {
  const { members } = useAuth();
  const { allWorkouts, assignPlan } = useWorkouts();
  const [planName, setPlanName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleAssign = (event) => {
    event.preventDefault();
    if (!memberEmail) {
      setMessage('Choose a member to assign this plan to.');
      return;
    }
    const plan = assignPlan({ memberEmail, name: planName || 'Coach plan' });
    if (plan) {
      const member = members.find((m) => m.email === memberEmail);
      setMessage(`Assigned “${plan.name}” to ${member ? member.name : memberEmail}.`);
      setPlanName('');
    }
  };

  return (
    <div>
      <PageHeader
        title="Coach Dashboard"
        subtitle="Build plans from the exercise library and assign them to your members"
      />

      <div className="two-col">
        <div className="two-col__side">
          <DraftWorkout title="New plan">
            <form onSubmit={handleAssign}>
              <FormField
                label="Plan name"
                placeholder="e.g. Week 1 — Full Body"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
              <FormField label="Assign to">
                {(fieldId) => (
                  <select
                    id={fieldId}
                    className="field__input"
                    value={memberEmail}
                    onChange={(e) => {
                      setMemberEmail(e.target.value);
                      setMessage('');
                    }}
                  >
                    <option value="">Select a member…</option>
                    {members.map((m) => (
                      <option key={m.email} value={m.email}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
              <Button type="submit" className="btn--block">
                Assign plan
              </Button>
            </form>
          </DraftWorkout>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </div>

        <div className="two-col__main">
          <h2 className="section__title">Your members</h2>
          {members.length === 0 ? (
            <EmptyState title="No members yet">
              <p>Members appear here once they register.</p>
            </EmptyState>
          ) : (
            <div className="stack">
              {members.map((member) => {
                const plans = allWorkouts.filter((w) => w.ownerEmail === member.email);
                const sessions = plans.flatMap((w) => w.logs);
                const last = sessions.map((s) => s.date).sort().pop();
                return (
                  <Card key={member.email} as="article" className="member-card">
                    <div className="member-card__head">
                      <h3 className="member-card__name">{member.name}</h3>
                      <span className="muted">{member.email}</span>
                    </div>
                    <p className="muted">
                      {plans.length} workout{plans.length === 1 ? '' : 's'} · {sessions.length}{' '}
                      session{sessions.length === 1 ? '' : 's'} logged
                      {last && <> · last active {formatDate(last)}</>}
                    </p>
                    {plans.length > 0 && (
                      <ul className="member-card__plans">
                        {plans.map((p) => (
                          <li key={p.id}>
                            <Link to={`/workouts/${p.id}`}>{p.name}</Link>
                            {p.assignedBy && <span className="chip chip--accent">assigned</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoachDashboardPage;

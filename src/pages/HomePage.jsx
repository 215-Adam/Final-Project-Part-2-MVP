import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  {
    title: 'Browse 800+ exercises',
    text: 'Search the open wger library by name, category, or muscle group, with how-to images.',
  },
  {
    title: 'Build & log workouts',
    text: 'Add exercises to a workout, then log sets, reps, and weight between sets.',
  },
  {
    title: 'Coach-assigned plans',
    text: 'Coaches build plans and assign them to members — no more lost screenshots.',
  },
];

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <p className="hero__eyebrow">Your training, in one place</p>
        <h1 className="hero__title">Know what you lifted last time. Lift more this time.</h1>
        <p className="hero__text">
          GymLog keeps your exercises, workouts, and coach plans together so you always know what
          to do next — and can see that you&apos;re getting stronger.
        </p>
        <div className="hero__actions">
          {user ? (
            <>
              <Link to="/workouts" className="btn btn--primary">Go to My Workouts</Link>
              <Link to="/exercises" className="btn btn--secondary">Browse exercises</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn--primary">Get started</Link>
              <Link to="/exercises" className="btn btn--secondary">Browse exercises</Link>
            </>
          )}
        </div>
        {!user && (
          <p className="hero__demo">
            Demo accounts — member: <code>member@gymlog.test</code> / <code>member123</code> ·
            coach: <code>coach@gymlog.test</code> / <code>coach123</code>
          </p>
        )}
      </section>

      <section className="features" aria-label="Features">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature">
            <h2 className="feature__title">{f.title}</h2>
            <p>{f.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default HomePage;

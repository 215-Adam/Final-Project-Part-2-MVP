import { Link, useLocation } from 'react-router-dom';

function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p className="muted">
        Nothing lives at <code>{pathname}</code>. Maybe it skipped leg day.
      </p>
      <Link to="/" className="btn btn--primary">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;

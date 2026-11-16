import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/workouts" replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    try {
      login(email, password);
      navigate(location.state?.from || '/workouts', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <Card title="Log in" className="auth__card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="btn--block">
            Log in
          </Button>
        </form>
        <p className="auth__switch">
          New to GymLog? <Link to="/register">Create an account</Link>
        </p>
        <p className="field__hint">
          Demo: member@gymlog.test / member123 · coach@gymlog.test / coach123
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'member' };

function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/workouts" replace />;

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const created = register(form);
      navigate(created.role === 'coach' ? '/coach' : '/workouts', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <Card title="Create your account" className="auth__card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Name" autoComplete="name" value={form.name} onChange={update('name')} />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            hint="At least 6 characters"
          />
          <fieldset className="field role-picker">
            <legend className="field__label">I am a…</legend>
            {['member', 'coach'].map((role) => (
              <label key={role} className="role-picker__option">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={update('role')}
                />
                <span>{role === 'member' ? 'Gym member' : 'Coach'}</span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="btn--block">
            Sign up
          </Button>
        </form>
        <p className="auth__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;

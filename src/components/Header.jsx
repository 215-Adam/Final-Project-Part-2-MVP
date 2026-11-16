import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../contexts/WorkoutContext';

function Header() {
  const { user, logout } = useAuth();
  const { draft } = useWorkouts();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__brand" onClick={close}>
          <span className="header__logo" aria-hidden="true">▲</span> GymLog
        </Link>

        <button
          type="button"
          className="header__toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
        </button>

        <nav id="main-nav" className={`nav ${menuOpen ? 'nav--open' : ''}`} aria-label="Main">
          <NavLink to="/" end className="nav__link" onClick={close}>Home</NavLink>
          <NavLink to="/exercises" className="nav__link" onClick={close}>Exercises</NavLink>
          {user && (
            <NavLink to="/workouts" className="nav__link" onClick={close}>
              My Workouts
              {draft.length > 0 && (
                <span className="badge" aria-label={`${draft.length} in current workout`}>
                  {draft.length}
                </span>
              )}
            </NavLink>
          )}
          {user?.role === 'coach' && (
            <NavLink to="/coach" className="nav__link" onClick={close}>Coach</NavLink>
          )}
          {user ? (
            <div className="nav__user">
              <span className="nav__name">
                {user.name} <span className="role-tag">{user.role}</span>
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav__user">
              <NavLink to="/login" className="nav__link" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn--primary btn--sm" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

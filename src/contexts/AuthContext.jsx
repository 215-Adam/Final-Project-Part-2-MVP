import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from '../utils/storage';

const USERS_KEY = 'gymlog.users';
const SESSION_KEY = 'gymlog.session';

// Demo accounts so graders can try both roles right away.
// NOTE: this is a frontend-only MVP; real auth (hashed passwords, JWT) is planned for the capstone.
export const DEMO_USERS = [
  { name: 'Maya Member', email: 'member@gymlog.test', password: 'member123', role: 'member' },
  { name: 'Carlos Coach', email: 'coach@gymlog.test', password: 'coach123', role: 'coach' },
];

const AuthContext = createContext(null);

function publicUser({ name, email, role }) {
  return { name, email, role };
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const stored = loadState(USERS_KEY, []);
    const missingDemo = DEMO_USERS.filter((d) => !stored.some((u) => u.email === d.email));
    return [...stored, ...missingDemo];
  });
  const [user, setUser] = useState(() => loadState(SESSION_KEY, null));

  useEffect(() => saveState(USERS_KEY, users), [users]);
  useEffect(() => saveState(SESSION_KEY, user), [user]);

  const login = useCallback(
    (email, password) => {
      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!match) throw new Error('Invalid email or password');
      const signedIn = publicUser(match);
      setUser(signedIn);
      return signedIn;
    },
    [users]
  );

  const register = useCallback(
    ({ name, email, password, role }) => {
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        throw new Error('An account with that email already exists');
      }
      const newUser = { name: name.trim(), email: normalized, password, role };
      setUsers((prev) => [...prev, newUser]);
      const signedIn = publicUser(newUser);
      setUser(signedIn);
      return signedIn;
    },
    [users]
  );

  const logout = useCallback(() => setUser(null), []);

  const members = useMemo(
    () => users.filter((u) => u.role === 'member').map(publicUser),
    [users]
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, register, members }),
    [user, login, logout, register, members]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

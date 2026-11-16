import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('starts logged out and logs in a demo user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.login('COACH@gymlog.test', 'coach123');
    });
    expect(result.current.user).toEqual({
      name: 'Carlos Coach',
      email: 'coach@gymlog.test',
      role: 'coach',
    });
    expect(result.current.user).not.toHaveProperty('password');
  });

  it('rejects a wrong password', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(() => result.current.login('member@gymlog.test', 'nope')).toThrow('Invalid email or password');
  });

  it('registers a new member, lists them for coaches, and logs out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.register({ name: 'Sam', email: 'Sam@Test.com', password: 'secret1', role: 'member' });
    });
    expect(result.current.user).toMatchObject({ email: 'sam@test.com', role: 'member' });
    expect(result.current.members.map((m) => m.email)).toContain('sam@test.com');

    expect(() =>
      result.current.register({ name: 'Sam 2', email: 'sam@test.com', password: 'secret1', role: 'member' })
    ).toThrow('already exists');

    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
  });
});

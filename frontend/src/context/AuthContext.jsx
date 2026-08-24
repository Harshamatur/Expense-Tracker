import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getToken, setToken as persistToken, clearToken } from '../services/api';
import { loginRequest, registerRequest, logoutRequest, meRequest } from '../services/authService';

export const AuthContext = createContext(null);

/**
 * Note on token storage: this build stores the JWT in localStorage for
 * simplicity, and keeps the token short-lived (see backend JWT_EXPIRES_IN).
 * This is a documented interview-build tradeoff — an httpOnly cookie with
 * server-side refresh/revocation would be the stronger production option,
 * but is out of scope for Phase 1.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const currentUser = await meRequest();
        setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    }
    bootstrap();
  }, [clearSession]);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
    }
    window.addEventListener('veyra:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('veyra:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await loginRequest(credentials);
    persistToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const { user: newUser, token } = await registerRequest(details);
    persistToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    initializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

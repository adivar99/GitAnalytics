'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';

interface User {
  id: string;
  email: string;
  full_name?: string;
  company_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    company_name: string;
    license_key: string;
    admin_email: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          // Decode token to get user ID
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          // Check for standard Hasura claims or root level sub
          const userId = payload['https://hasura.io/jwt/claims']?.['x-hasura-user-id'] || payload.sub;

          if (userId) {
            // Fetch user details
            // We use apiClient directly here to avoid circular dependency or Apollo hook rules in useEffect
            // But apiClient.graphqlRequest is private. We can assume we need to make a raw fetch or use a public method.
            // Actually apiClient.graphqlRequest is private.
            // We can extend ApiClient or make a quick fetch here.
            // Let's use fetch directly for this specific restoration to keep it simple and encapsulated.
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/v1/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${savedToken}`,
              },
              body: JSON.stringify({
                query: `
                  query GetCurrentUserContext($userId: uuid!) {
                    users(where: { id: { _eq: $userId } }) {
                      id
                      email
                      full_name
                      company_id
                    }
                  }
                `,
                variables: { userId },
              }),
            });

            const result = await response.json();
            if (result.data?.users?.[0]) {
              const userData = result.data.users[0];
              setUser({
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                company_id: userData.company_id
              });
            }
          }
        } catch (error) {
          console.error("Failed to restore user session:", error);
          // If token is invalid, maybe logout?
          // Cookies.remove('auth_token'); 
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      // Ensure response.user structure matches our User interface
      // apiClient.login returns { token, user: { id, email, fullName/full_name, companyId/company_id } }
      // We need to map it correctly.
      const { token: newToken, user: userData } = response;

      // Store token in cookie
      Cookies.set('auth_token', newToken, { expires: 1 }); // 1 day expiry

      setToken(newToken);
      // Map response user to state user if needed. 
      // Assuming API returns consistent casing, but let's be safe.
      // previous implementation just did setUser(userData).
      // Let's inspect userData from api.ts: { id, email, fullName, companyId }
      // Our interface uses snake_case keys (full_name, company_id) because queries return that.
      // We should unify. queries.ts returns snake_case.
      // api.ts login mutation returns camelCase aliases (fullName, companyId) -> see api.ts line 50.
      // So we have a mismatch.
      // I will map it here.
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName || userData.full_name,
        company_id: userData.companyId || userData.company_id
      });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: {
    company_name: string;
    license_key: string;
    admin_email: string;
    password: string;
    full_name?: string;
  }) => {
    try {
      const response = await apiClient.signup(data);
      const { token: newToken, user: userData } = response;

      // Store token in cookie
      Cookies.set('auth_token', newToken, { expires: 1 }); // 1 day expiry

      setToken(newToken);
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName || userData.full_name,
        company_id: userData.companyId || userData.company_id
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


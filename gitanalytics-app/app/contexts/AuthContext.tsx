'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import apolloClient from '@/lib/apollo-client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  company_id: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  GUEST = 'guest'
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
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
  updateUserRole: (role: UserRole) => void;
  getRoleForProject: (projectId: string) => Promise<string | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          // Decode token to get user ID and role
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          console.log("Payload: ", payload);

          // Extract Hasura claims
          const hasuraClaims = payload['https://hasura.io/jwt/claims'];
          const userId = hasuraClaims?.['x-hasura-user-id'] || payload.sub;
          const defaultRole = hasuraClaims?.['x-hasura-default-role'];

          // Set user role from JWT token
          if (defaultRole === 'admin') {
            setUserRole(UserRole.ADMIN);
          } else if (defaultRole === 'manager') {
            setUserRole(UserRole.MANAGER);
          } else {
            setUserRole(UserRole.DEVELOPER);
          }

          console.log('Setting User role as: ', userRole);

          if (userId) {
            // Fetch user details from database using Apollo Client
            const GET_CURRENT_USER_CONTEXT = `
              query GetCurrentUserContext($userId: uuid!) {
                users(where: { id: { _eq: $userId } }) {
                  id
                  email
                  full_name
                  company_id
                }
              }
            `;

            const result = await apolloClient.query({
              query: GET_CURRENT_USER_CONTEXT,
              variables: { userId },
              fetchPolicy: 'network-only', // Always fetch fresh data
            });

            if (result.data?.users?.[0]) {
              const userData = result.data.users[0];
              setUser({
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                company_id: userData.company_id
              });
            } else {
              console.error('=== AuthContext: No user found in database ===');
            }
          }
        } catch (error) {
          console.error("Failed to restore user session:", error);
          // If token is invalid, logout
          Cookies.remove('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const updateUserRole = (role: UserRole) => {
    setUserRole(role);
  };

  const getRoleForProject = async (projectId: string) => {
    const getRoleQuery = `
      query GetMemberRole ($userId: uuid!, $projectId: uuid!) {
        project_members(where: {project_id: {_eq: $projectId}, user_id: {_eq: $userId}}) {
          role
        }
      }
    `;

    const variables = {
      userId: user?.id,
      projectId
    };
    const result = await apiClient.graphqlRequest<{ project_members: { role: string }[] }>(
      getRoleQuery,
      variables
    );

    if (result.project_members?.[0]) {
      return result.project_members[0].role;
    }

    return null;

  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const { token: newToken, user: userData } = response;

      // Store token in cookie
      Cookies.set('auth_token', newToken, { expires: 1 }); // 1 day expiry

      setToken(newToken);

      // Extract role from JWT token
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        const hasuraClaims = payload['https://hasura.io/jwt/claims'];
        const defaultRole = hasuraClaims?.['x-hasura-default-role'];

        if (defaultRole === 'admin') {
          setUserRole(UserRole.ADMIN);
        } else if (defaultRole === 'manager') {
          setUserRole(UserRole.MANAGER);
        } else {
          setUserRole(UserRole.DEVELOPER);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
      }

      // Set user data
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
      setUserRole(UserRole.ADMIN);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setToken(null);
    setUser(null);
    setUserRole(null);
  };

  const value: AuthContextType = {
    user,
    userRole,
    token,
    loading,
    updateUserRole,
    getRoleForProject,
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


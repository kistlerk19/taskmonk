import { Auth } from 'aws-amplify';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  username: string;
  email: string;
  attributes: {
    email: string;
    sub: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      return await Auth.signUp({
        username: email,
        password,
        attributes: { 
          email,
          'name.givenName': firstName || email.split('@')[0], // Default to username part of email if not provided
          'name.familyName': lastName || '' // Default to empty string if not provided
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async function confirmSignUp(email: string, code: string) {
    try {
      return await Auth.confirmSignUp(email, code);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }

  async function forgotPassword(email: string) {
    try {
      return await Auth.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  }

  async function resetPassword(email: string, code: string, newPassword: string) {
    try {
      return await Auth.forgotPasswordSubmit(email, code, newPassword);
    } catch (error) {
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
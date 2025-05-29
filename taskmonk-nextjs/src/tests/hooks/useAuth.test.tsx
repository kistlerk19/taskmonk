import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '@/lib/auth/authContext';

// Mock AWS Amplify Auth
jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    signOut: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
  },
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication state', async () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      attributes: {
        email: 'test@example.com',
        sub: '123',
      },
    };

    const { Auth } = require('aws-amplify');
    Auth.currentAuthenticatedUser.mockResolvedValue(mockUser);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Initially loading should be true and user should be null
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);

    await waitForNextUpdate();

    // After resolving, loading should be false and user should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles sign in', async () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      attributes: {
        email: 'test@example.com',
        sub: '123',
      },
    };

    const { Auth } = require('aws-amplify');
    Auth.currentAuthenticatedUser.mockRejectedValue(new Error('No user'));
    Auth.signIn.mockResolvedValue(mockUser);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.user).toBe(null);

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(Auth.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles sign out', async () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      attributes: {
        email: 'test@example.com',
        sub: '123',
      },
    };

    const { Auth } = require('aws-amplify');
    Auth.currentAuthenticatedUser.mockResolvedValue(mockUser);
    Auth.signOut.mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);

    await act(async () => {
      await result.current.signOut();
    });

    expect(Auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import TaskForm from '@/components/tasks/TaskForm';
import { api } from '@/lib/api/apiClient';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/authContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Task Workflow Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    query: {},
  };

  const mockTeams = [
    {
      id: '1',
      name: 'Frontend Team',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'developer' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'designer' },
      ],
    },
    {
      id: '2',
      name: 'Backend Team',
      members: [
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'developer' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (require('next/router').useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/teams') {
        return Promise.resolve(mockTeams);
      }
      return Promise.resolve(null);
    });
  });

  it('allows creating a new task', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <TaskForm />
      </QueryClientProvider>
    );

    // Wait for teams to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/teams');
    });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'New Test Task' },
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a test task description' },
    });
    
    fireEvent.change(screen.getByLabelText(/Team/i), {
      target: { value: '1' },
    });
    
    fireEvent.change(screen.getByLabelText(/Priority/i), {
      target: { value: 'high' },
    });
    
    // Submit the form
    (api.post as jest.Mock).mockResolvedValueOnce({
      id: '123',
      title: 'New Test Task',
      description: 'This is a test task description',
      status: 'todo',
      priority: 'high',
      teamId: '1',
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
        title: 'New Test Task',
        description: 'This is a test task description',
        teamId: '1',
        priority: 'high',
      }));
    });
    
    // Verify navigation after successful creation
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/tasks');
    });
  });
});
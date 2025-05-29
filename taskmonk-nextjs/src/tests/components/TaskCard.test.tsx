import { render, screen } from '@testing-library/react';
import TaskCard from '@/components/tasks/TaskCard';
import { Task } from '@/types';

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task',
    status: 'in_progress',
    priority: 'high',
    teamId: '1',
    createdAt: '2023-07-01',
    updatedAt: '2023-07-10',
    assignee: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'developer'
    }
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    // Check if title is rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    
    // Check if status is rendered
    expect(screen.getByText('In progress')).toBeInTheDocument();
    
    // Check if priority is rendered
    expect(screen.getByText('High')).toBeInTheDocument();
    
    // Check if assignee is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders unassigned state correctly', () => {
    const unassignedTask = { ...mockTask, assignee: undefined, assigneeId: undefined };
    render(<TaskCard task={unassignedTask} />);
    
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('formats due date correctly', () => {
    const taskWithDueDate = { ...mockTask, dueDate: '2023-12-31' };
    render(<TaskCard task={taskWithDueDate} />);
    
    expect(screen.getByText(/Dec 31, 2023/)).toBeInTheDocument();
  });

  it('shows "No due date" when due date is not set', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });
});
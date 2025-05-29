import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/middleware';

// Mock data - in a real app, this would be in a database
const tasks = [
  {
    id: '1',
    title: 'Implement authentication',
    description: 'Set up AWS Cognito authentication for the application',
    status: 'done',
    priority: 'high',
    assigneeId: '1',
    assignee: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'developer'
    },
    teamId: '1',
    dueDate: '2023-07-15',
    createdAt: '2023-07-01',
    updatedAt: '2023-07-10'
  },
  {
    id: '2',
    title: 'Design dashboard UI',
    description: 'Create wireframes and implement the dashboard UI',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: '2',
    assignee: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'designer'
    },
    teamId: '1',
    dueDate: '2023-07-20',
    createdAt: '2023-07-05',
    updatedAt: '2023-07-12'
  },
  {
    id: '3',
    title: 'API integration',
    description: 'Connect frontend with backend API endpoints',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    assignee: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'developer'
    },
    teamId: '2',
    dueDate: '2023-07-25',
    createdAt: '2023-07-08',
    updatedAt: '2023-07-08'
  }
];

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }
  
  try {
    switch (req.method) {
      case 'GET':
        res.status(200).json(tasks[taskIndex]);
        return;
        
      case 'PUT':
        const updatedTask = {
          ...tasks[taskIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        tasks[taskIndex] = updatedTask;
        res.status(200).json(updatedTask);
        return;
        
      case 'DELETE':
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        res.status(200).json(deletedTask);
        return;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
}

export default withAuth(handler);
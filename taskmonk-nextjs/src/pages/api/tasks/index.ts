import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/middleware';

// Mock data for tasks
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
  try {
    switch (req.method) {
      case 'GET':
        // Filter tasks based on query parameters
        let filteredTasks = [...tasks];
        const { status, teamId, assigneeId, limit } = req.query;
        
        if (status) {
          filteredTasks = filteredTasks.filter(task => task.status === status);
        }
        
        if (teamId) {
          filteredTasks = filteredTasks.filter(task => task.teamId === teamId);
        }
        
        if (assigneeId) {
          filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId);
        }
        
        if (limit) {
          filteredTasks = filteredTasks.slice(0, parseInt(limit as string));
        }
        
        res.status(200).json(filteredTasks);
        return;
        
      case 'POST':
        // Create a new task
        const newTask = {
          id: (tasks.length + 1).toString(),
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        res.status(201).json(newTask);
        return;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
}

export default withAuth(handler);
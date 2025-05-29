import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/middleware';

// Mock user data
const user = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'developer',
  teamId: '1'
};

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    switch (req.method) {
      case 'GET':
        res.status(200).json(user);
        return;
        
      case 'PUT':
        // Update user profile
        const updatedUser = {
          ...user,
          ...req.body
        };
        
        // In a real app, you would save this to a database
        Object.assign(user, updatedUser);
        
        res.status(200).json(updatedUser);
        return;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
}

export default withAuth(handler);
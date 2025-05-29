import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/middleware';

// Mock data for teams
const teams = [
  {
    id: '1',
    name: 'Frontend Team',
    description: 'Responsible for the user interface and experience',
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'developer'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'designer'
      }
    ],
    createdAt: '2023-06-15'
  },
  {
    id: '2',
    name: 'Backend Team',
    description: 'Responsible for the server-side logic and database',
    members: [
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'developer'
      }
    ],
    createdAt: '2023-06-20'
  },
  {
    id: '3',
    name: 'DevOps Team',
    description: 'Responsible for deployment and infrastructure',
    members: [
      {
        id: '4',
        name: 'Alice Williams',
        email: 'alice@example.com',
        role: 'devops'
      }
    ],
    createdAt: '2023-06-25'
  }
];

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    switch (req.method) {
      case 'GET':
        res.status(200).json(teams);
        return;
        
      case 'POST':
        const newTeam = {
          id: (teams.length + 1).toString(),
          ...req.body,
          createdAt: new Date().toISOString()
        };
        
        teams.push(newTeam);
        res.status(201).json(newTeam);
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
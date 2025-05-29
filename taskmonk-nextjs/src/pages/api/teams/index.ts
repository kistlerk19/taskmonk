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
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    switch (req.method) {
      case 'GET':
        res.status(200).json(teams);
        return;
        
      case 'POST':
        console.log('Creating new team with data:', req.body);
        
        if (!req.body || !req.body.name) {
          res.status(400).json({ message: 'Team name is required' });
          return;
        }
        
        const newTeam = {
          id: (teams.length + 1).toString(),
          ...req.body,
          members: req.body.members || [],
          createdAt: new Date().toISOString()
        };
        
        teams.push(newTeam);
        res.status(201).json(newTeam);
        return;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error: any) {
    console.error('API error in teams handler:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
}

export default withAuth(handler);
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
  }
];

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;
  const teamIndex = teams.findIndex(team => team.id === id);
  
  if (teamIndex === -1) {
    res.status(404).json({ message: 'Team not found' });
    return;
  }
  
  try {
    if (req.method === 'POST') {
      const { email, role } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      
      // Check if user is already a member
      const existingMember = teams[teamIndex].members.find(member => member.email === email);
      if (existingMember) {
        res.status(400).json({ message: 'User is already a member of this team' });
        return;
      }
      
      // In a real app, you would send an invitation email here
      // For this mock, we'll just add the user directly
      const newMember = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0], // Use part of email as name
        email,
        role: role || 'member'
      };
      
      teams[teamIndex].members.push(newMember);
      
      res.status(200).json({ message: 'Invitation sent successfully' });
      return;
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
}

export default withAuth(handler);
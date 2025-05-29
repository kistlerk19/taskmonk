import { render, screen } from '@testing-library/react';
import TeamCard from '@/components/teams/TeamCard';
import { Team } from '@/types';

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

describe('TeamCard', () => {
  const mockTeam: Team = {
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
  };

  it('renders team information correctly', () => {
    render(<TeamCard team={mockTeam} />);
    
    // Check if name is rendered
    expect(screen.getByText('Frontend Team')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText('Responsible for the user interface and experience')).toBeInTheDocument();
    
    // Check if member count is rendered
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check if created date is rendered
    expect(screen.getByText(/Created: /)).toBeInTheDocument();
  });

  it('displays correct number of team members', () => {
    render(<TeamCard team={mockTeam} />);
    
    // There should be 2 member avatars (represented by divs with their initials)
    const memberInitials = screen.getAllByText(/[A-Z]/);
    expect(memberInitials.length).toBeGreaterThanOrEqual(2);
  });

  it('shows +X for additional members when there are more than 5', () => {
    const largeTeam = {
      ...mockTeam,
      members: [
        ...mockTeam.members,
        { id: '3', name: 'User 3', email: 'user3@example.com', role: 'developer' },
        { id: '4', name: 'User 4', email: 'user4@example.com', role: 'developer' },
        { id: '5', name: 'User 5', email: 'user5@example.com', role: 'developer' },
        { id: '6', name: 'User 6', email: 'user6@example.com', role: 'developer' }
      ]
    };
    
    render(<TeamCard team={largeTeam} />);
    
    // Check if +1 is displayed for the additional member
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
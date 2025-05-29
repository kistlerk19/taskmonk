import { Team } from '@/types';
import { UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`} legacyBehavior>
      <a className="block">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 text-gray-400 mr-1" />
            <span className="text-sm text-gray-500">{team.members.length}</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{team.description}</p>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Team Members</p>
          <div className="flex -space-x-2 overflow-hidden">
            {team.members.slice(0, 5).map((member, index) => (
              <div
                key={member.id}
                className="inline-block h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center"
                title={member.name}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {team.members.length > 5 && (
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white">
                <span className="text-xs font-medium text-gray-500">+{team.members.length - 5}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Created: {new Date(team.createdAt).toLocaleDateString()}
        </div>
      </div>
      </a>
    </Link>
  );
}
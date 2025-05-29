import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/lib/api/apiClient';
import { Team } from '@/types';

interface TeamFormProps {
  teamId?: string;
}

export default function TeamForm({ teamId }: TeamFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!teamId;
  
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    description: '',
    members: []
  });
  
  const [error, setError] = useState('');
  
  // Fetch team data if editing
  const { data: team, isLoading: teamLoading } = useQuery<Team>(
    ['team', teamId],
    () => api.get<Team>(`/teams/${teamId}`),
    {
      enabled: isEditing,
      onSuccess: (data: Team) => {
        setFormData({
          name: data.name,
          description: data.description,
          members: data.members
        });
      }
    }
  );
  
  // Create team mutation
  const createTeam = useMutation(
    (newTeam: Partial<Team>) => api.post<Team>('/teams', newTeam),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        router.push('/teams');
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to create team');
      }
    }
  );
  
  // Update team mutation
  const updateTeam = useMutation(
    (updatedTeam: Partial<Team>) => api.put<Team>(`/teams/${teamId}`, updatedTeam),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team', teamId]);
        queryClient.invalidateQueries('teams');
        router.push(`/teams/${teamId}`);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to update team');
      }
    }
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isEditing) {
        await updateTeam.mutateAsync(formData);
      } else {
        await createTeam.mutateAsync(formData);
      }
    } catch (err) {
      // Error is handled in mutation callbacks
    }
  };
  
  if (isEditing && teamLoading) {
    return <div className="text-center py-4">Loading team...</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEditing ? 'Edit Team' : 'Create New Team'}
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">
              Team Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          {isEditing && (
            <div>
              <label className="form-label">Team Members</label>
              <div className="mt-1 bg-gray-50 p-4 rounded-md">
                {formData.members && formData.members.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {formData.members.map((member) => (
                      <li key={member.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No members in this team yet.</p>
                )}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/teams/${teamId}/invite`)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Invite Members
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTeam.isLoading || updateTeam.isLoading}
              className="btn btn-primary"
            >
              {createTeam.isLoading || updateTeam.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Team'
                : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
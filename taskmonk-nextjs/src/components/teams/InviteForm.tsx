import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '@/lib/api/apiClient';

interface InviteFormProps {
  teamId: string;
}

export default function InviteForm({ teamId }: InviteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const inviteMutation = useMutation(
    (data: { email: string; role: string }) => 
      api.post(`/teams/${teamId}/invite`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team', teamId]);
        setSuccess('Invitation sent successfully!');
        setEmail('');
        setRole('member');
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to send invitation');
      }
    }
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      await inviteMutation.mutateAsync({ email, role });
    } catch (err) {
      // Error is handled in mutation callbacks
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Invite Team Members
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Send invitations to join your team.
        </p>
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
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="colleague@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="member">Team Member</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/teams/${teamId}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isLoading}
              className="btn btn-primary"
            >
              {inviteMutation.isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
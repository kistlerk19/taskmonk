import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { api } from '@/lib/api/apiClient';
import { Team } from '@/types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function TeamDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const { data: team, isLoading: teamLoading, error } = useQuery<Team>(
    ['team', id],
    () => api.get(`/teams/${id}`),
    {
      enabled: !!id && !!user,
    }
  );

  const deleteTeam = useMutation(
    () => api.delete(`/teams/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        router.push('/teams');
      }
    }
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this team?')) {
      await deleteTeam.mutateAsync();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading team. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{team?.name || 'Team Detail'} | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Team Detail</h1>
          <div className="mt-3 flex sm:mt-0 sm:ml-4">
            <button
              type="button"
              onClick={() => router.push(`/teams/${id}/invite`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              Invite Members
            </button>
            <button
              type="button"
              onClick={() => router.push(`/teams/${id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>

        {team && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{team.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on {formatDate(team.createdAt)}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {team.description || 'No description provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                  {team.members.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {team.members.map((member) => (
                        <li key={member.id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {member.role}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No members in this team yet.</p>
                  )}
                </div>
              </dl>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { api } from '@/lib/api/apiClient';
import { Team } from '@/types';
import TeamCard from '@/components/teams/TeamCard';
import { useQuery } from 'react-query';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Teams() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data: teams, isLoading } = useQuery<Team[]>(
    'teams',
    () => api.get('/teams'),
    { enabled: !!user }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Teams | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <button
              type="button"
              onClick={() => router.push('/teams/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading teams...</div>
          ) : teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new team.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/teams/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Team
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
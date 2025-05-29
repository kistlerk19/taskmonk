import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import InviteForm from '@/components/teams/InviteForm';
import { api } from '@/lib/api/apiClient';
import { Team } from '@/types';
import { useQuery } from 'react-query';

export default function InviteTeamMembers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const { data: team, isLoading: teamLoading } = useQuery<Team>(
    ['team', id],
    () => api.get(`/teams/${id}`),
    {
      enabled: !!id && !!user,
    }
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Invite Team Members | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Invite Members to {team?.name}
          </h1>
        </div>

        <div className="mt-6">
          <InviteForm teamId={id as string} />
        </div>
      </Layout>
    </>
  );
}
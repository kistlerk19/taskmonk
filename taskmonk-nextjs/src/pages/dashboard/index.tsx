import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { api } from '@/lib/api/apiClient';
import { Task, Team } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TeamCard from '@/components/teams/TeamCard';
import { useQuery } from 'react-query';
import { 
  ClipboardDocumentListIcon, 
  UsersIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>(
    'recentTasks',
    () => api.get('/tasks?limit=5'),
    { enabled: !!user }
  );

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>(
    'teams',
    () => api.get('/teams'),
    { enabled: !!user }
  );

  // Mock data for stats
  const stats = [
    { name: 'Total Tasks', value: '24', icon: ClipboardDocumentListIcon, color: 'bg-blue-500' },
    { name: 'Completed Tasks', value: '12', icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Pending Tasks', value: '8', icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Teams', value: '3', icon: UsersIcon, color: 'bg-purple-500' },
  ];

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
        <title>Dashboard | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
            <button
              onClick={() => router.push('/tasks')}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </button>
          </div>
          {tasksLoading ? (
            <div className="text-center py-4">Loading tasks...</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tasks found</p>
              <button
                onClick={() => router.push('/tasks/new')}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create a task
              </button>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Teams</h2>
            <button
              onClick={() => router.push('/teams')}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </button>
          </div>
          {teamsLoading ? (
            <div className="text-center py-4">Loading teams...</div>
          ) : teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-lg shadow">
              <p className="text-gray-500">No teams found</p>
              <button
                onClick={() => router.push('/teams/new')}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create a team
              </button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
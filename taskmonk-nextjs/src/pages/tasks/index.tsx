import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { api } from '@/lib/api/apiClient';
import { Task } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import { useQuery } from 'react-query';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Tasks() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const { data: tasks, isLoading } = useQuery<Task[]>(
    ['tasks', filter],
    () => api.get(`/tasks${filter !== 'all' ? `?status=${filter}` : ''}`),
    { enabled: !!user }
  );

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'done', label: 'Done' },
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
        <title>Tasks | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <button
              type="button"
              onClick={() => router.push('/tasks/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                <span className="text-sm text-gray-700">Filter by:</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-10 sm:flex-none">
              <div className="flex space-x-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      filter === option.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading tasks...</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new task.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/tasks/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Task
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
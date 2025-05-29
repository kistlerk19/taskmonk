import { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api/apiClient';
import { useQuery } from 'react-query';
// Import charts with dynamic loading to prevent SSR issues
const DynamicCharts = dynamic(() => import('../../components/reports/DynamicCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  ),
});

// Report data is now in the DynamicCharts component

export default function Reports() {
  const { user, loading } = useAuth();
  const [reportType, setReportType] = useState('task_status');

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
        <title>Reports | TaskMonk</title>
      </Head>
      <Layout>
        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>

        {/* Report Type Selector */}
        <div className="mt-4">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">Report Type:</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-10 sm:flex-none">
              <div className="flex space-x-2">
                <button
                  onClick={() => setReportType('task_status')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    reportType === 'task_status'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Task Status
                </button>
                <button
                  onClick={() => setReportType('task_completion')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    reportType === 'task_completion'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Task Completion
                </button>
                <button
                  onClick={() => setReportType('team_performance')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    reportType === 'team_performance'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Team Performance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {reportType === 'task_status'
              ? 'Task Status Distribution'
              : reportType === 'task_completion'
              ? 'Weekly Task Completion'
              : 'Team Performance'}
          </h2>

          <div className="h-80">
            <DynamicCharts reportType={reportType} />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
          <div className="prose max-w-none">
            {reportType === 'task_status' ? (
              <p>
                The majority of tasks are currently in the "Done" status (40%), followed by "To Do" (33%),
                "In Progress" (17%), and "In Review" (10%). This indicates a healthy workflow with a good
                completion rate.
              </p>
            ) : reportType === 'task_completion' ? (
              <p>
                Task completion has been consistent throughout the week, with a peak on Friday.
                The team completed 21 out of 33 tasks this week, achieving a 64% completion rate.
              </p>
            ) : (
              <p>
                Team A has the highest number of tasks (25) and completed tasks (18), achieving a 72% completion rate.
                Team C follows with a 75% completion rate (15/20), while Team B has a 67% completion rate (10/15).
              </p>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
import { Task } from '@/types';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      case 'in_progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'done':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/tasks/${task.id}`} legacyBehavior>
      <a className="block">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {task.assignee ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="ml-2">
              <p className="text-xs text-gray-500">Assigned to</p>
              <p className="text-sm font-medium text-gray-900">{task.assignee?.name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(task.status)}
            <span className="ml-1 text-sm text-gray-500">
              {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Due: {formatDate(task.dueDate)}
        </div>
      </div>
      </a>
    </Link>
  );
}
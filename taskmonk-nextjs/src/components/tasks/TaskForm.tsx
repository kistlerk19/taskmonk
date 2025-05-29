import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/lib/api/apiClient';
import { Task, Team, User } from '@/types';

interface TaskFormProps {
  taskId?: string;
}

export default function TaskForm({ taskId }: TaskFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!taskId;
  
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
    teamId: '',
    dueDate: ''
  });
  
  const [error, setError] = useState('');
  
  // Fetch task data if editing
  const { data: task, isLoading: taskLoading } = useQuery<Task>(
    ['task', taskId],
    () => api.get<Task>(`/tasks/${taskId}`),
    {
      enabled: isEditing,
      onSuccess: (data: Task) => {
        setFormData({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId,
          teamId: data.teamId,
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : ''
        });
      }
    }
  );
  
  // Fetch teams for dropdown
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>(
    'teams',
    () => api.get<Team[]>('/teams')
  );
  
  // Create task mutation
  const createTask = useMutation(
    (newTask: Partial<Task>) => api.post<Task>('/tasks', newTask),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        router.push('/tasks');
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to create task');
      }
    }
  );
  
  // Update task mutation
  const updateTask = useMutation(
    (updatedTask: Partial<Task>) => api.put<Task>(`/tasks/${taskId}`, updatedTask),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', taskId]);
        queryClient.invalidateQueries('tasks');
        router.push(`/tasks/${taskId}`);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to update task');
      }
    }
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isEditing) {
        await updateTask.mutateAsync(formData);
      } else {
        await createTask.mutateAsync(formData);
      }
    } catch (err) {
      // Error is handled in mutation callbacks
    }
  };
  
  if (isEditing && taskLoading) {
    return <div className="text-center py-4">Loading task...</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEditing ? 'Edit Task' : 'Create New Task'}
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
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
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
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="teamId" className="form-label">
                Team
              </label>
              <select
                id="teamId"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select a team</option>
                {teams?.map((team: Team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="assigneeId" className="form-label">
                Assignee
              </label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Unassigned</option>
                {teams?.find((team: Team) => team.id === formData.teamId)?.members.map((member: User) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
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
              disabled={createTask.isLoading || updateTask.isLoading}
              className="btn btn-primary"
            >
              {createTask.isLoading || updateTask.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Task'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
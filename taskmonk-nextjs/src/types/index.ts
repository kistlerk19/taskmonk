export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  assignee?: User;
  teamId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'task_completion' | 'team_performance' | 'user_productivity';
  data: any;
  createdAt: string;
}
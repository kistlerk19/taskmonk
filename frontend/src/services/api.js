import { API } from 'aws-amplify';

const apiName = 'taskmonk';

export const userService = {
  createUser: (userData) => {
    return API.post(apiName, '/users', { body: userData });
  },
  getCurrentUser: () => {
    return API.get(apiName, '/users/me');
  }
};

export const teamService = {
  createTeam: (teamData) => {
    return API.post(apiName, '/teams', { body: teamData });
  },
  getTeams: () => {
    return API.get(apiName, '/teams');
  },
  getTeam: (teamId) => {
    return API.get(apiName, `/teams/${teamId}`);
  },
  inviteToTeam: (inviteData) => {
    return API.post(apiName, '/teams/invite', { body: inviteData });
  }
};

export const taskService = {
  createTask: (taskData) => {
    return API.post(apiName, '/tasks', { body: taskData });
  },
  getUserTasks: () => {
    return API.get(apiName, '/tasks/my');
  },
  getTeamTasks: (teamId) => {
    return API.get(apiName, `/teams/${teamId}/tasks`);
  },
  getTask: (taskId) => {
    return API.get(apiName, `/tasks/${taskId}`);
  },
  updateTaskStatus: (taskId, status) => {
    return API.put(apiName, '/tasks/status', { 
      body: { taskId, status } 
    });
  },
  filterTasks: (filterData) => {
    return API.post(apiName, '/tasks/filter', { body: filterData });
  }
};

export const commentService = {
  getComments: (taskId) => {
    return API.get(apiName, `/tasks/${taskId}/comments`);
  },
  addComment: (taskId, content) => {
    return API.post(apiName, `/tasks/${taskId}/comments`, { 
      body: { content } 
    });
  }
};

export const reportService = {
  generateReport: (reportData) => {
    return API.post(apiName, '/reports/tasks', { body: reportData });
  }
};
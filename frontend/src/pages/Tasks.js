import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, formatDistanceToNow } from 'date-fns';

const Tasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [openNewTask, setOpenNewTask] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    teamId: '',
    priority: 'Medium',
    assignedTo: '',
    deadline: null
  });
  
  const [filters, setFilters] = useState({
    teamId: '',
    status: '',
    priority: '',
    assignedTo: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchTasks();
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get('taskmonk', '/tasks/my');
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await API.get('taskmonk', '/teams');
      if (response.success) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // This would be replaced with actual API call
      const response = await API.get('taskmonk', '/users');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      const response = await API.post('taskmonk', '/tasks', {
        body: newTask
      });
      
      if (response.success) {
        setTasks([...tasks, response.data]);
        setOpenNewTask(false);
        setNewTask({
          title: '',
          description: '',
          teamId: '',
          priority: 'Medium',
          assignedTo: '',
          deadline: null
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterTasks = async () => {
    try {
      setLoading(true);
      const response = await API.post('taskmonk', '/tasks/filter', {
        body: {
          ...filters,
          searchTerm: searchTerm
        }
      });
      
      if (response.success) {
        setTasks(response.data);
        setOpenFilters(false);
      }
    } catch (error) {
      console.error('Error filtering tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await API.put('taskmonk', '/tasks/status', {
        body: {
          taskId,
          status: newStatus
        }
      });
      
      if (response.success) {
        setTasks(tasks.map(task => 
          task.taskId === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'Todo':
        color = 'warning';
        break;
      case 'InProgress':
        color = 'primary';
        break;
      case 'Review':
        color = 'secondary';
        break;
      case 'Done':
        color = 'success';
        break;
      default:
        break;
    }
    return <Chip label={status} color={color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    let color = 'default';
    switch (priority) {
      case 'Low':
        color = 'info';
        break;
      case 'Medium':
        color = 'warning';
        break;
      case 'High':
        color = 'error';
        break;
      case 'Critical':
        color = 'error';
        break;
      default:
        break;
    }
    return <Chip label={priority} color={color} size="small" variant="outlined" />;
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.teamId === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenNewTask(true)}
        >
          New Task
        </Button>
      </Box>
      
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={() => setOpenFilters(true)}
            >
              Advanced Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Grid item xs={12} sm={6} md={4} key={task.taskId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {task.description.substring(0, 100)}
                      {task.description.length > 100 ? '...' : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {getStatusChip(task.status)}
                      {getPriorityChip(task.priority)}
                    </Box>
                    <Typography variant="body2">
                      <strong>Team:</strong> {getTeamName(task.teamId)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Assigned to:</strong> {getUserName(task.assignedTo)}
                    </Typography>
                    {task.deadline && (
                      <Typography variant="body2">
                        <strong>Due:</strong> {format(new Date(task.deadline), 'MMM d, yyyy')}
                        {' '}
                        ({formatDistanceToNow(new Date(task.deadline), { addSuffix: true })})
                      </Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.taskId, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="Todo">To Do</MenuItem>
                        <MenuItem value="InProgress">In Progress</MenuItem>
                        <MenuItem value="Review">Review</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                      </Select>
                    </FormControl>
                    <Button size="small" href={`/tasks/${task.taskId}`}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">No tasks found</Typography>
                <Typography variant="body2" color="textSecondary">
                  Create a new task or adjust your filters
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* New Task Dialog */}
      <Dialog open={openNewTask} onClose={() => setOpenNewTask(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  value={newTask.teamId}
                  label="Team"
                  onChange={(e) => setNewTask({...newTask, teamId: e.target.value})}
                  required
                >
                  {teams.map(team => (
                    <MenuItem key={team.teamId} value={team.teamId}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  label="Assign To"
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Deadline"
                  value={newTask.deadline}
                  onChange={(date) => setNewTask({...newTask, deadline: date})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTask(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained"
            disabled={!newTask.title || !newTask.teamId}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filters Dialog */}
      <Dialog open={openFilters} onClose={() => setOpenFilters(false)} maxWidth="md" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  value={filters.teamId}
                  label="Team"
                  onChange={(e) => setFilters({...filters, teamId: e.target.value})}
                >
                  <MenuItem value="">All Teams</MenuItem>
                  {teams.map(team => (
                    <MenuItem key={team.teamId} value={team.teamId}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Todo">To Do</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Review">Review</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={filters.assignedTo}
                  label="Assigned To"
                  onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                >
                  <MenuItem value="">Anyone</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => setFilters({...filters, startDate: date})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => setFilters({...filters, endDate: date})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilters(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setFilters({
                teamId: '',
                status: '',
                priority: '',
                assignedTo: '',
                startDate: null,
                endDate: null
              });
              setSearchTerm('');
            }}
          >
            Clear Filters
          </Button>
          <Button onClick={handleFilterTasks} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tasks;
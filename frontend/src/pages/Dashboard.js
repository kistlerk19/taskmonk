import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatDistanceToNow } from 'date-fns';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get('taskmonk', '/tasks/my');
      if (response.success) {
        setTasks(response.data);
        calculateTaskStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskStats = (taskList) => {
    const stats = {
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0
    };

    taskList.forEach(task => {
      switch (task.status) {
        case 'Todo':
          stats.todo++;
          break;
        case 'InProgress':
          stats.inProgress++;
          break;
        case 'Review':
          stats.review++;
          break;
        case 'Done':
          stats.done++;
          break;
        default:
          break;
      }
    });

    setTaskStats(stats);
  };

  const chartData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        data: [taskStats.todo, taskStats.inProgress, taskStats.review, taskStats.done],
        backgroundColor: ['#ff9800', '#2196f3', '#9c27b0', '#4caf50'],
        hoverBackgroundColor: ['#ffb74d', '#64b5f6', '#ba68c8', '#81c784'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Task Status Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Task Status
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {tasks.length > 0 ? (
                  <Doughnut data={chartData} options={chartOptions} />
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No tasks available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Task Summary */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Task Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" align="center">
                        {taskStats.todo}
                      </Typography>
                      <Typography variant="body2" align="center">
                        To Do
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" align="center">
                        {taskStats.inProgress}
                      </Typography>
                      <Typography variant="body2" align="center">
                        In Progress
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" align="center">
                        {taskStats.review}
                      </Typography>
                      <Typography variant="body2" align="center">
                        Review
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" align="center">
                        {taskStats.done}
                      </Typography>
                      <Typography variant="body2" align="center">
                        Done
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Recent Tasks */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              {tasks.length > 0 ? (
                <List>
                  {tasks.slice(0, 5).map((task) => (
                    <ListItem key={task.taskId} divider>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span" color="textSecondary">
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 ? '...' : ''}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              {getStatusChip(task.status)}
                              {getPriorityChip(task.priority)}
                              {task.deadline && (
                                <Chip 
                                  label={`Due ${formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              )}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No tasks available
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Dashboard;
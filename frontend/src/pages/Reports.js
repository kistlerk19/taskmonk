import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [taskCompletionData, setTaskCompletionData] = useState({
    labels: [],
    datasets: []
  });
  const [taskDistributionData, setTaskDistributionData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchTeams();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      generateTaskCompletionChart();
      generateTaskDistributionChart();
    }
  }, [tasks, selectedTeam, dateRange]);

  const fetchTeams = async () => {
    try {
      // This would be replaced with actual API call
      const response = await API.get('taskmonk', '/teams');
      if (response.success) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      const response = await API.get('taskmonk', '/tasks/all');
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  const handleStartDateChange = (date) => {
    setDateRange(prev => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date) => {
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  const applyFilters = () => {
    generateTaskCompletionChart();
    generateTaskDistributionChart();
  };

  const generateTaskCompletionChart = () => {
    // Filter tasks based on selected team and date range
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const isInDateRange = taskDate >= dateRange.startDate && taskDate <= dateRange.endDate;
      const isInTeam = selectedTeam === 'all' || task.teamId === selectedTeam;
      return isInDateRange && isInTeam;
    });

    // Group tasks by date
    const tasksByDate = filteredTasks.reduce((acc, task) => {
      const date = new Date(task.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { created: 0, completed: 0 };
      }
      acc[date].created += 1;
      if (task.status === 'Done') {
        acc[date].completed += 1;
      }
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(tasksByDate).sort();

    // Prepare chart data
    const chartData = {
      labels: sortedDates,
      datasets: [
        {
          label: 'Created Tasks',
          data: sortedDates.map(date => tasksByDate[date].created),
          backgroundColor: 'rgba(33, 150, 243, 0.5)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 1,
        },
        {
          label: 'Completed Tasks',
          data: sortedDates.map(date => tasksByDate[date].completed),
          backgroundColor: 'rgba(76, 175, 80, 0.5)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1,
        }
      ]
    };

    setTaskCompletionData(chartData);
  };

  const generateTaskDistributionChart = () => {
    // Filter tasks based on selected team and date range
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const isInDateRange = taskDate >= dateRange.startDate && taskDate <= dateRange.endDate;
      const isInTeam = selectedTeam === 'all' || task.teamId === selectedTeam;
      return isInDateRange && isInTeam;
    });

    // Count tasks by status
    const tasksByStatus = filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = 0;
      }
      acc[task.status] += 1;
      return acc;
    }, {});

    // Prepare chart data
    const chartData = {
      labels: Object.keys(tasksByStatus),
      datasets: [
        {
          label: 'Tasks by Status',
          data: Object.values(tasksByStatus),
          backgroundColor: [
            'rgba(255, 152, 0, 0.7)',
            'rgba(33, 150, 243, 0.7)',
            'rgba(156, 39, 176, 0.7)',
            'rgba(76, 175, 80, 0.7)'
          ],
          borderColor: [
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(76, 175, 80, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };

    setTaskDistributionData(chartData);
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Filters */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="team-select-label">Team</InputLabel>
                  <Select
                    labelId="team-select-label"
                    id="team-select"
                    value={selectedTeam}
                    label="Team"
                    onChange={handleTeamChange}
                  >
                    <MenuItem value="all">All Teams</MenuItem>
                    {teams.map(team => (
                      <MenuItem key={team.teamId} value={team.teamId}>{team.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.endDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          <Grid container spacing={3}>
            {/* Task Completion Chart */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Task Creation vs Completion
                </Typography>
                <Box sx={{ height: 400 }}>
                  {taskCompletionData.labels.length > 0 ? (
                    <Line data={taskCompletionData} options={barOptions} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography variant="body1" color="textSecondary">
                        No data available for the selected filters
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Task Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Task Distribution by Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  {taskDistributionData.labels.length > 0 ? (
                    <Bar data={taskDistributionData} options={barOptions} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography variant="body1" color="textSecondary">
                        No data available for the selected filters
                      </Typography>
                    </Box>
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
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1">
                    <strong>Total Tasks:</strong> {tasks.length}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Completed Tasks:</strong> {tasks.filter(task => task.status === 'Done').length}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Completion Rate:</strong> {
                      tasks.length > 0 
                        ? `${Math.round((tasks.filter(task => task.status === 'Done').length / tasks.length) * 100)}%` 
                        : '0%'
                    }
                  </Typography>
                  <Typography variant="body1">
                    <strong>Average Completion Time:</strong> 3.5 days
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
};

export default Reports;
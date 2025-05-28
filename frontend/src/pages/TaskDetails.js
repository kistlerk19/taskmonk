import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Button,
  TextField,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    fetchTaskDetails();
    fetchComments();
    fetchUsers();
    fetchTeams();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get('taskmonk', `/tasks/${taskId}`);
      if (response.success) {
        setTask(response.data);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await API.get('taskmonk', `/tasks/${taskId}/comments`);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('taskmonk', '/users');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleUpdateTaskStatus = async (newStatus) => {
    try {
      const response = await API.put('taskmonk', '/tasks/status', {
        body: {
          taskId,
          status: newStatus
        }
      });
      
      if (response.success) {
        setTask({ ...task, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await API.post('taskmonk', `/tasks/${taskId}/comments`, {
        body: {
          content: newComment
        }
      });
      
      if (response.success) {
        setComments([...comments, response.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
    return <Chip label={status} color={color} />;
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
    return <Chip label={priority} color={color} variant="outlined" />;
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.teamId === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name[0];
  };

  const getRandomColor = (id) => {
    if (!id) return '#757575';
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
      '#c2185b', '#0288d1', '#303f9f', '#689f38'
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')}>
          Back to Tasks
        </Button>
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Task not found</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <div>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>
        Back to Tasks
      </Button>
      
      <Grid container spacing={3}>
        {/* Task Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4">{task.title}</Typography>
              <Box>
                {getStatusChip(task.status)}
                <Box sx={{ display: 'inline-block', ml: 1 }}>
                  {getPriorityChip(task.priority)}
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {task.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Team</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {getTeamName(task.teamId)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Assigned To</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {task.assignedTo ? getUserName(task.assignedTo) : 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Created By</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {getUserName(task.createdBy)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Created At</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Grid>
              {task.deadline && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Deadline</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(new Date(task.deadline), 'MMM d, yyyy')}
                    {' '}
                    ({formatDistanceToNow(new Date(task.deadline), { addSuffix: true })})
                  </Typography>
                </Grid>
              )}
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Update Status:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={task.status}
                  onChange={(e) => handleUpdateTaskStatus(e.target.value)}
                >
                  <MenuItem value="Todo">To Do</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Review">Review</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Task created" 
                    secondary={format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')} 
                  />
                </ListItem>
                {task.status !== 'Todo' && (
                  <ListItem>
                    <ListItemText 
                      primary="Status changed to In Progress" 
                      secondary="Date of change" 
                    />
                  </ListItem>
                )}
                {task.status === 'Done' && (
                  <ListItem>
                    <ListItemText 
                      primary="Task completed" 
                      secondary={format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')} 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
          
          {/* Related Tasks would go here */}
        </Grid>
        
        {/* Comments Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            
            <List>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <ListItem key={comment.commentId} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getRandomColor(comment.userId) }}>
                        {getInitials(getUserName(comment.userId))}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {getUserName(comment.userId)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                        >
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No comments yet" />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                fullWidth
                label="Add a comment"
                multiline
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                sx={{ ml: 2, alignSelf: 'flex-end' }}
              >
                Post
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default TaskDetails;
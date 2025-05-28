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
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Teams = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [openNewTeam, setOpenNewTeam] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  });
  
  const [invitation, setInvitation] = useState({
    email: '',
    teamId: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await API.get('taskmonk', '/teams');
      if (response.success) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
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

  const handleCreateTeam = async () => {
    try {
      setLoading(true);
      const response = await API.post('taskmonk', '/teams', {
        body: newTeam
      });
      
      if (response.success) {
        setTeams([...teams, response.data]);
        setOpenNewTeam(false);
        setNewTeam({
          name: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      setLoading(true);
      const response = await API.post('taskmonk', '/teams/invite', {
        body: invitation
      });
      
      if (response.success) {
        setOpenInvite(false);
        setInvitation({
          email: '',
          teamId: ''
        });
        // Refresh teams to show updated member list
        fetchTeams();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInviteDialog = (team) => {
    setSelectedTeam(team);
    setInvitation({
      email: '',
      teamId: team.teamId
    });
    setOpenInvite(true);
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
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
      '#c2185b', '#0288d1', '#303f9f', '#689f38'
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teams</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenNewTeam(true)}
        >
          New Team
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teams.length > 0 ? (
            teams.map(team => (
              <Grid item xs={12} md={6} key={team.teamId}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: getRandomColor(team.teamId) }}>
                        {team.name[0]}
                      </Avatar>
                    }
                    title={team.name}
                    subheader={`${team.members.length} members`}
                    action={
                      <Tooltip title="Invite Member">
                        <IconButton onClick={() => openInviteDialog(team)}>
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Team Members:
                    </Typography>
                    <List dense>
                      {team.members.slice(0, 5).map(memberId => (
                        <ListItem key={memberId}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getRandomColor(memberId) }}>
                              {getInitials(getUserName(memberId))}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={getUserName(memberId)} 
                            secondary={memberId === team.ownerId ? 'Team Owner' : 'Member'} 
                          />
                        </ListItem>
                      ))}
                      {team.members.length > 5 && (
                        <ListItem>
                          <ListItemText 
                            primary={`+${team.members.length - 5} more members`} 
                            sx={{ pl: 9 }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<GroupIcon />}
                      onClick={() => navigate(`/teams/${team.teamId}`)}
                    >
                      View Team
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/teams/${team.teamId}/tasks`)}
                    >
                      View Tasks
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">No teams found</Typography>
                <Typography variant="body2" color="textSecondary">
                  Create a new team to get started
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* New Team Dialog */}
      <Dialog open={openNewTeam} onClose={() => setOpenNewTeam(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team Name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTeam(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTeam} 
            variant="contained"
            disabled={!newTeam.name}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Invite User Dialog */}
      <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Invite to {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={invitation.email}
                onChange={(e) => setInvitation({...invitation, email: e.target.value})}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
          <Button 
            onClick={handleInviteUser} 
            variant="contained"
            disabled={!invitation.email}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Teams;
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { BusinessCenter, VerifiedUser, AttachMoney, TrendingUp, Add, Notifications, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { agentsAPI } from '../../../../api/agents';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await agentsAPI.getDashboard(token);
      if (response.success) setDashboardData(response.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  const stats = [
    { icon: <BusinessCenter />, title: 'Total Properties', value: dashboardData?.stats?.totalProperties || 0, change: '+2 this week', color: 'primary' },
    { icon: <VerifiedUser />, title: 'Active Verifications', value: dashboardData?.stats?.activeVerifications || 0, change: '+1 pending', color: 'success' },
    { icon: <AttachMoney />, title: 'Monthly Earnings', value: `₦${(dashboardData?.stats?.monthlyEarnings || 0).toLocaleString()}`, change: '+25% from last month', color: 'warning' },
    { icon: <TrendingUp />, title: 'Trust Score', value: `${dashboardData?.stats?.trustScore || 0}/100`, change: '+4 points', color: 'info' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Agent Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Welcome back, {user?.fullName || 'Agent'}! 👋</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Notifications />} onClick={() => navigate('/notifications')}>Notifications</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/agent/properties/new')}>New Property</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${stat.color}.main`, mr: 2 }}>{stat.icon}</Box>
                  <Typography variant="h6">{stat.title}</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>{stat.value}</Typography>
                <Typography variant="body2" color="success.main">{stat.change}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Recent Properties</Typography>
              <Button variant="text" onClick={() => navigate('/agent/properties')}>View All</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData?.recentProperties?.map((property) => (
                    <TableRow key={property._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={property.images?.[0]} sx={{ mr: 2 }}>P</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{property.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{property.propertyType}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{property.location?.city}</TableCell>
                      <TableCell><Typography fontWeight="bold">₦{property.price?.toLocaleString()}</Typography></TableCell>
                      <TableCell>
                        <Chip label={property.status} color={property.status === 'AVAILABLE' ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/properties/${property._id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/agent/properties/new')} fullWidth>Add New Property</Button>
              <Button variant="outlined" startIcon={<VerifiedUser />} onClick={() => navigate('/agent/verifications')} fullWidth>View Verifications</Button>
              <Button variant="outlined" startIcon={<Person />} onClick={() => navigate('/profile')} fullWidth>Update Profile</Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Performance</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>Response Rate</Typography>
              <LinearProgress variant="determinate" value={dashboardData?.performance?.responseRate || 0} sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">{dashboardData?.performance?.responseRate || 0}% • Faster than 85% of agents</Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>Completion Rate</Typography>
              <LinearProgress variant="determinate" value={dashboardData?.performance?.completionRate || 0} sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">{dashboardData?.performance?.completionRate || 0}% • 45/50 jobs completed</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentDashboard;

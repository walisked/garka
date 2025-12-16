import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

const Profile = () => {
	const { user } = useAuth();

	return (
		<Box sx={{ py: 4 }}>
			<Paper sx={{ p: 3 }}>
				<Typography variant="h5" gutterBottom>Profile</Typography>
				<Typography><strong>Name:</strong> {user?.fullName || '—'}</Typography>
				<Typography><strong>Email:</strong> {user?.email || '—'}</Typography>
				<Box sx={{ mt: 2 }}>
					<Button variant="contained">Edit Profile</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default Profile;

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => (
	<Box sx={{ textAlign: 'center', py: 8 }}>
		<Typography variant="h3" gutterBottom>
			Welcome to DigiAGIS
		</Typography>
		<Typography color="text.secondary" sx={{ mb: 4 }}>
			Property marketplace and verification platform
		</Typography>
		<Button variant="contained" component={RouterLink} to="/marketplace">Browse properties</Button>
	</Box>
);

export default Home;

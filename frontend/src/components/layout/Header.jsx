import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	return (
		<AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
						DigiAGIS
					</Typography>
					<Button component={RouterLink} to="/marketplace">Marketplace</Button>
				</Box>

				<Box>
					{!user ? (
						<>
							<Button component={RouterLink} to="/login">Login</Button>
							<Button component={RouterLink} to="/register" variant="contained" sx={{ ml: 1 }}>Register</Button>
						</>
					) : (
						<>
							<Button onClick={() => navigate('/profile')}>Profile</Button>
							<Button onClick={() => { logout(); navigate('/'); }}>Logout</Button>
						</>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Header;

import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
	<Box component="footer" sx={{ mt: 6, py: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
		<Typography variant="body2" color="text.secondary">
			© {new Date().getFullYear()} DigiAGIS — Built with care
		</Typography>
	</Box>
);

export default Footer;

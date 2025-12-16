import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { verificationAPI } from '../../../api/verification';
import { useNotifications } from '../../../contexts/NotificationContext';
import toast from 'react-hot-toast';

const VerificationDetail = () => {
	const { id } = useParams();
	const { token, user } = useAuth();
	const { push } = useNotifications();
	const [data, setData] = useState(null);

	useEffect(() => {
		const fetch = async () => {
			try {
				const res = await verificationAPI.getVerification(id, token);
				if (res.success) setData(res.data.verification || res.data);
			} catch (err) {
				toast.error('Failed to load verification');
			}
		};
		fetch();
	}, [id, token]);

	const handleClaim = async () => {
		try {
			const res = await verificationAPI.claimVerification(id, token);
			if (res.success) {
				push({ message: 'Verification claimed successfully' });
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to claim');
		}
	};

	return (
		<Box sx={{ py: 4 }}>
			<Paper sx={{ p: 3 }}>
				<Typography variant="h5" gutterBottom>Verification Detail</Typography>
				{data ? (
					<Box>
						<Typography><strong>Property:</strong> {data.propertyId || data.property}</Typography>
						<Typography><strong>Status:</strong> {data.requestStatus || data.status || '—'}</Typography>
						<Typography><strong>Requested at:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleString() : '—'}</Typography>

						{/* Allow deal initiators to claim */}
						{user?.role === 'DEAL_INITIATOR' && (
							<Box sx={{ mt: 2 }}>
								<Button variant="contained" onClick={handleClaim}>Claim Verification</Button>
							</Box>
						)}
					</Box>
				) : (
					<Typography color="text.secondary">Loading...</Typography>
				)}
			</Paper>
		</Box>
	);
};

export default VerificationDetail;

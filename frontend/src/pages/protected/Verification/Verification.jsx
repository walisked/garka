import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import { verificationAPI } from '../../../api/verification';
import { useNotifications } from '../../../contexts/NotificationContext';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
	propertyId: Yup.string().required('Property ID is required'),
	agentId: Yup.string().required('Agent ID is required'),
	termsAccepted: Yup.boolean().oneOf([true], 'You must accept the terms')
});

const Verification = () => {
	const { token } = useAuth();
	const { push } = useNotifications();

	return (
		<Box sx={{ py: 4 }}>
			<Paper sx={{ p: 3 }}>
				<Typography variant="h5" gutterBottom>Request Verification</Typography>

				<Formik
					initialValues={{ propertyId: '', agentId: '', termsAccepted: false }}
					validationSchema={validationSchema}
					onSubmit={async (values, { setSubmitting, resetForm }) => {
						setSubmitting(true);
						try {
							const res = await verificationAPI.requestVerification(values, token);
							if (res.success) {
								push({ message: 'Verification requested successfully' });
								resetForm();
							}
						} catch (err) {
							toast.error(err.response?.data?.message || 'Failed to request verification');
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{({ values, errors, touched, handleChange, isSubmitting }) => (
						<Form>
							<Field as={TextField} fullWidth name="propertyId" label="Property ID" sx={{ mb: 2 }} error={touched.propertyId && !!errors.propertyId} helperText={touched.propertyId && errors.propertyId} />

							<Field as={TextField} fullWidth name="agentId" label="Agent ID" sx={{ mb: 2 }} error={touched.agentId && !!errors.agentId} helperText={touched.agentId && errors.agentId} />

							<FormControlLabel control={<Field as={Checkbox} name="termsAccepted" checked={values.termsAccepted} onChange={handleChange} />} label="I accept the terms and conditions" sx={{ display: 'block', mb: 2 }} />

							<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
								<Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button>
								<Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Requesting...' : 'Request Verification'}</Button>
							</Box>
						</Form>
					)}
				</Formik>
			</Paper>
		</Box>
	);
};

export default Verification;

import React from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
	email: Yup.string().email('Invalid email').required('Required'),
	password: Yup.string().required('Required')
});

const redirectByRole = (role, navigate) => {
	switch (role) {
		case 'ADMIN':
			return navigate('/admin/dashboard');
		case 'AGENT':
			return navigate('/agent/dashboard');
		case 'DEAL_INITIATOR':
			return navigate('/deal-initiator/dashboard');
		case 'USER':
		default:
			return navigate('/user/dashboard');
	}
};

const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	return (
		<Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
			<Paper sx={{ p: 4 }}>
				<Typography variant="h5" gutterBottom>
					Sign in to your account
				</Typography>

				<Formik
					initialValues={{ email: '', password: '' }}
					validationSchema={validationSchema}
					onSubmit={async (values, { setSubmitting }) => {
						setSubmitting(true);
						const res = await login(values.email, values.password);
						setSubmitting(false);
						if (res.success) {
							toast.success('Welcome back!');
							redirectByRole(res.user?.role, navigate);
						}
					}}
				>
					{({ values, errors, touched, handleChange, isSubmitting }) => (
						<Form>
							<Field
								as={TextField}
								fullWidth
								name="email"
								label="Email"
								value={values.email}
								onChange={handleChange}
								error={touched.email && !!errors.email}
								helperText={touched.email && errors.email}
								sx={{ mb: 2 }}
							/>

							<Field
								as={TextField}
								fullWidth
								name="password"
								label="Password"
								type="password"
								value={values.password}
								onChange={handleChange}
								error={touched.password && !!errors.password}
								helperText={touched.password && errors.password}
								sx={{ mb: 3 }}
							/>

							<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
								<Button type="submit" variant="contained" disabled={isSubmitting}>
									{isSubmitting ? 'Signing in...' : 'Sign in'}
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
			</Paper>
		</Box>
	);
};

export default Login;

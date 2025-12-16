import React from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
	fullName: Yup.string().required('Full name is required'),
	email: Yup.string().email('Invalid email').required('Required'),
	password: Yup.string().min(6, 'At least 6 characters').required('Required'),
});

const Register = () => {
	const { register } = useAuth();
	const navigate = useNavigate();

	return (
		<Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
			<Paper sx={{ p: 4 }}>
				<Typography variant="h5" gutterBottom>
					Create an account
				</Typography>

				<Formik
					initialValues={{ fullName: '', email: '', password: '' }}
					validationSchema={validationSchema}
					onSubmit={async (values, { setSubmitting }) => {
						setSubmitting(true);
						const res = await register({ fullName: values.fullName, email: values.email, password: values.password });
						setSubmitting(false);
						if (res.success) {
							toast.success('Registration successful');
							navigate('/');
						}
					}}
				>
					{({ values, errors, touched, handleChange, isSubmitting }) => (
						<Form>
							<Field
								as={TextField}
								fullWidth
								name="fullName"
								label="Full name"
								value={values.fullName}
								onChange={handleChange}
								error={touched.fullName && !!errors.fullName}
								helperText={touched.fullName && errors.fullName}
								sx={{ mb: 2 }}
							/>

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

							<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button type="submit" variant="contained" disabled={isSubmitting}>
									{isSubmitting ? 'Creating account...' : 'Create account'}
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
			</Paper>
		</Box>
	);
};

export default Register;

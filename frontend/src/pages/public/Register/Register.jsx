import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  BusinessCenter,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import AuthLayout from '../AuthLayout';

const Signup = () => {
  const location = useLocation();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 0: Account Type
    userType: location?.state?.userType || '',
    
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Professional Info (for agents/experts)
    agisId: '',
    specialization: '',
    yearsOfExperience: '',
    company: '',
    licenseNumber: '',
    
    // Step 3: Terms
    agreeToTerms: false,
    subscribeToUpdates: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const steps = [
    'Account Type',
    'Basic Information',
    'Professional Details',
    'Confirmation'
  ];

  const userTypes = [
    {
      value: 'user',
      label: 'Buyer / Seller',
      icon: <Person />,
      description: 'Looking to buy or sell properties using your personal email'
    },
    {
      value: 'agent',
      label: 'Certified Agent',
      icon: <BusinessCenter />,
      description: 'AGIS-certified property agent (requires official DigiAGIS email)'
    },
  ];

  const specializations = [
    'Residential Properties',
    'Commercial Properties',
    'Land Documentation',
    'Property Verification',
    'Surveying',
    'Legal Services',
    'Valuation',
    'Property Management'
  ];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setError('');
    
    // Validation based on current step
    if (activeStep === 0 && !formData.userType) {
      setError('Please select your account type');
      return;
    }
    
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      // Validate agent emails
      if (formData.userType === 'agent' && !formData.email.includes('@digiagis')) {
        setError('Agents must use official DigiAGIS email addresses provided by the platform administrator.');
        return;
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use the context register method
    const result = await register(formData);

    if (result?.success) {
      // Always go to marketplace after registration
      navigate('/marketplace');
    } else {
      setError(result?.error || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              How will you use DigiAGIS?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Choose the account type that best describes you
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              {userTypes.map((type) => (
                <Paper
                  key={type.value}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: formData.userType === type.value ? 2 : 1,
                    borderColor: formData.userType === type.value ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'primary.main' }}>
                      {type.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+234 XXX XXX XXXX"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Box>
        );

      case 2:
        if (formData.userType !== 'agent') {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Almost Done!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your {formData.userType === 'user' ? 'buyer/seller' : formData.userType} account is ready to be created. 
                Click next to review your information.
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="AGIS Certification ID"
              name="agisId"
              value={formData.agisId}
              onChange={handleChange}
              placeholder="ABJ-AGIS-XXXX"
            />

            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                name="specialization"
                value={formData.specialization}
                label="Specialization"
                onChange={handleChange}
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Years of Experience"
              name="yearsOfExperience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Company (Optional)"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Professional License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Account Type: <strong>{userTypes.find(t => t.value === formData.userType)?.label}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Name: {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Email: {formData.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Phone: {formData.phone}
              </Typography>
              
              {formData.agisId && (
                <Typography variant="body2">
                  AGIS ID: {formData.agisId}
                </Typography>
              )}
            </Paper>

            <Alert severity="info" sx={{ mb: 2 }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              {formData.userType === 'agent' && ' Your AGIS certification will be verified within 24-48 hours.'}
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                aria-label="Agree to terms"
              />
              <Typography variant="body2" component="label" htmlFor="agreeToTerms">
                I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link>.
              </Typography>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <AuthLayout
      title="Join DigiAGIS"
      subtitle="Create your account in just a few steps"
    >
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.agreeToTerms}
              endIcon={<ArrowForward />}
              onClick={(e) => {
                if (!formData.agreeToTerms) {
                  e.preventDefault();
                  setError('You must agree to the Terms of Service and Privacy Policy');
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </form>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight="bold">
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Signup;
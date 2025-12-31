import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext";
import AuthLayout from '../AuthLayout';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Always route to marketplace after login (per new frontend flow)
      navigate('/marketplace');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  // Only demo accounts for Buyer/Seller
  const demoAccounts = [
    {
      type: 'user',
      icon: <Person />,
      email: 'buyer@demo.com',
      password: 'demo123',
      label: 'Buyer Demo'
    },
    {
      type: 'user',
      icon: <Person />,
      email: 'seller@demo.com',
      password: 'demo123',
      label: 'Seller Demo'
    },
  ];

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setFormData({
      email: demoEmail,
      password: demoPassword,
      rememberMe: false
    });
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your DigiAGIS account"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Visibility color="action" />
              </InputAdornment>
            ),
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Remember me"
          />
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2, mb: 2 }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Demo Access
          </Typography>
        </Divider>

        {/* Demo Accounts - Only Buyer/Seller */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Quick demo access for buyers/sellers:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {demoAccounts.map((account, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={account.icon}
                onClick={() => handleDemoLogin(account.email, account.password)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {account.label} ({account.email})
              </Button>
            ))}
          </Box>
        </Box>

        {/* Official Account Instructions */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Agents & Admins:</strong> Use your official DigiAGIS email address provided by the platform administrator.
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight="bold">
              Sign up
            </Link>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default Login;
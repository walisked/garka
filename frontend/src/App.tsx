import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import './styles/global.css';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout
import { Layout } from './components/layout';

// Pages
import Home from './pages/public/Home/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Marketplace from './pages/public/Marketplace/Marketplace';
import Profile from './pages/protected/Profile/Profile';
import Verification from './pages/protected/Verification/Verification';
import VerificationDetail from './pages/protected/Verification/VerificationDetail';

// Role routes and placeholders
import {
  ProtectedRoute,
  AdminRoute,
  AgentRoute,
  DealInitiatorRoute,
  UserRoute,
} from './routes/RoleRoutes';

import AdminDashboard from './pages/protected/Admin/Dashboard/Dashboard';
import AgentDashboard from './pages/protected/Agent/Dashboard/Dashboard';
import PropertyForm from './pages/protected/Agent/Properties/PropertyForm';
import DealInitiatorDashboard from './pages/protected/DealInitiator/Dashboard/Dashboard';
import UserDashboard from './pages/protected/User/Dashboard/Dashboard';

// theme is imported from src/styles/theme.js

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/marketplace" element={<Marketplace />} />

                {/* Protected */}
                <Route element={<ProtectedRoute /> }>
                  <Route path="/profile" element={<Profile />} />

                  {/* Verification pages */}
                  <Route path="/verifications" element={<Verification />} />
                  <Route path="/verifications/:id" element={<VerificationDetail />} />
                </Route>

                {/* Role-based */}
                <Route element={<AdminRoute /> }>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                <Route element={<AgentRoute /> }>
                  <Route path="/agent/dashboard" element={<AgentDashboard />} />
                  <Route path="/agent/properties/new" element={<PropertyForm />} />
                </Route>

                <Route element={<DealInitiatorRoute /> }>
                  <Route path="/deal-initiator/dashboard" element={<DealInitiatorDashboard />} />
                </Route>

                <Route element={<UserRoute /> }>
                  <Route path="/user/dashboard" element={<UserDashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
            <Toaster position="top-right" />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute = () => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" />;
	if (user.role !== 'ADMIN') return <Navigate to="/unauthorized" />;
	return <Outlet />;
};

export const AgentRoute = () => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" />;
	if (user.role !== 'AGENT') return <Navigate to="/unauthorized" />;
	return <Outlet />;
};

export const DealInitiatorRoute = () => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" />;
	if (user.role !== 'DEAL_INITIATOR') return <Navigate to="/unauthorized" />;
	return <Outlet />;
};

export const UserRoute = () => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" />;
	if (user.role !== 'USER') return <Navigate to="/unauthorized" />;
	return <Outlet />;
};

export const ProtectedRoute = () => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" />;
	return <Outlet />;
};

export default null;

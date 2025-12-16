import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider');
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('digiagis_token'));
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			const storedToken = localStorage.getItem('digiagis_token');
			const storedUser = localStorage.getItem('digiagis_user');

			if (storedToken && storedUser) {
				try {
					setToken(storedToken);
					setUser(JSON.parse(storedUser));
				} catch (err) {
					localStorage.removeItem('digiagis_token');
					localStorage.removeItem('digiagis_user');
				}
			}
			setLoading(false);
		};
		init();
	}, []);

	const register = async (userData) => {
		try {
			setLoading(true);
			const res = await authAPI.register(userData);
			if (res.success) {
				const { token: t, user: u } = res.data;
				setToken(t);
				setUser(u);
				localStorage.setItem('digiagis_token', t);
				localStorage.setItem('digiagis_user', JSON.stringify(u));
				toast.success('Registration successful');
				return { success: true, user: u };
			}
			return { success: false, error: res.message };
		} catch (err) {
			toast.error(err.response?.data?.message || 'Registration failed');
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			setLoading(true);
			const res = await authAPI.login({ email, password });
			if (res.success) {
				const { token: t, user: u } = res.data;
				setToken(t);
				setUser(u);
				localStorage.setItem('digiagis_token', t);
				localStorage.setItem('digiagis_user', JSON.stringify(u));
				toast.success('Login successful');
				return { success: true, user: u };
			}
			return { success: false, error: res.message };
		} catch (err) {
			toast.error(err.response?.data?.message || 'Invalid credentials');
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('digiagis_token');
		localStorage.removeItem('digiagis_user');
		toast.success('Logged out successfully');
	};

	const updateProfile = async (userId, data) => {
		try {
			const res = await authAPI.updateProfile(userId, data, token);
			if (res.success) {
				setUser(res.data.user);
				localStorage.setItem('digiagis_user', JSON.stringify(res.data.user));
				toast.success('Profile updated');
				return { success: true };
			}
			return { success: false };
		} catch (err) {
			toast.error(err.response?.data?.message || 'Update failed');
			return { success: false };
		}
	};

	const value = { user, token, loading, register, login, logout, updateProfile };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

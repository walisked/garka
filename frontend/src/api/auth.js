import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

const withAuth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const authAPI = {
	register: async (userData) => {
		const res = await client.post('/auth/register', userData);
		return res.data;
	},

	login: async (credentials) => {
		const res = await client.post('/auth/login', credentials);
		return res.data;
	},

	getProfile: async (token) => {
		const res = await client.get('/auth/profile', withAuth(token));
		return res.data;
	},

	updateProfile: async (userId, data, token) => {
		const res = await client.put(`/auth/profile/${userId}`, data, withAuth(token));
		return res.data;
	},

	changePassword: async (data, token) => {
		const res = await client.post('/auth/change-password', data, withAuth(token));
		return res.data;
	},

	logout: async (token) => {
		const res = await client.post('/auth/logout', {}, withAuth(token));
		return res.data;
	}
};

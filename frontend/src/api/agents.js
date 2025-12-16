import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({ baseURL: API_BASE_URL });

const withAuth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const agentsAPI = {
	getDashboard: async (token) => {
		const res = await client.get('/agent/dashboard', withAuth(token));
		return res.data;
	},

	createProperty: async (formData, token) => {
		const res = await client.post('/agent/properties', formData, {
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	},

	getProperties: async (filters, token) => {
		const res = await client.get('/agent/properties', { params: filters, ...withAuth(token) });
		return res.data;
	},

	uploadDocuments: async (documents, token) => {
		const formData = new FormData();
		documents.forEach((d) => formData.append('documents', d));
		const res = await client.post('/agent/documents', formData, {
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	},

	getVerifications: async (status, token) => {
		const res = await client.get('/agent/verifications', { params: { status }, ...withAuth(token) });
		return res.data;
	}
};

export default agentsAPI;

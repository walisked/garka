import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
	return ctx;
};

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	const push = (n) => {
		setNotifications((prev) => [n, ...prev]);
		toast(n.message || 'Notification');
	};

	const value = { notifications, push };

	return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;

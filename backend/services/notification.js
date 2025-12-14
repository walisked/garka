import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async ({ user, title, message }) => {
  return await Notification.create({
    user,
    title,
    message
  });
};

export const notifyAdmins = async ({ title, message, type, data }) => {
  const admins = await User.find({ role: 'ADMIN' }).select('_id');
  const notifications = admins.map(a => ({ user: a._id, title, message }));
  return await Notification.insertMany(notifications);
};

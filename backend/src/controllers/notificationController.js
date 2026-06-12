const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    const filter = { user: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    const notifications = await Notification.find(filter).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markRead, markAllRead };

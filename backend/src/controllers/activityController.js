const ActivityLog = require('../models/ActivityLog');

const getMyActivity = async (req, res, next) => {
  try {
    const { entityType, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (entityType) filter.entityType = entityType;

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { getMyActivity };

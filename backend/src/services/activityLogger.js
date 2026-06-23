const ActivityLog = require('../models/ActivityLog');

const log = async ({ user, role, action, entityType, entityId, description, oldStatus = null, newStatus = null, metadata = {} }) => {
  try {
    await ActivityLog.create({ user, role, action, entityType, entityId, description, oldStatus, newStatus, metadata });
  } catch (err) {
    console.error('[ActivityLog Error]', err.message);
  }
};

module.exports = { log };

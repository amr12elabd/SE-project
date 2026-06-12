const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const users = await User.find(filter).select('-passwordHash').sort('-createdAt');
    res.json(users);
  } catch (err) { next(err); }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, passwordHash: password, role, phone, bio,
      createdBy: req.user._id
    });
    const result = await User.findById(user._id).select('-passwordHash');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, bio, avatarUrl, notificationPreferences } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'organizer' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (notificationPreferences) user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };

    await user.save();
    const result = await User.findById(user._id).select('-passwordHash');
    res.json(result);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.isModified = false;
    await User.updateOne({ _id: user._id }, { passwordHash: user.passwordHash });
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = false;
    await user.save();
    res.json({ message: 'User deactivated successfully' });
  } catch (err) { next(err); }
};

const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = true;
    await user.save();
    res.json({ message: 'User activated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUser, createUser, updateUser, changePassword, deactivateUser, activateUser };

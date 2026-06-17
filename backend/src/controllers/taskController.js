const Task = require('../models/Task');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { notifyUser } = require('../socket');

const getTasks = async (req, res, next) => {
  try {
    const { event, status, assignedTo, priority } = req.query;
    const filter = {};

    if (req.user.role === 'staff') filter.assignedTo = req.user._id;
    if (event) filter.event = event;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('event', 'name date')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, priority: -1 });
    res.json(tasks);
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { event, title, description, assignedTo, speciality, dueDate, priority } = req.body;
    if (!event || !title) return res.status(400).json({ message: 'Event and title are required' });

    const task = await Task.create({
      event, title, description, assignedTo, speciality,
      dueDate, priority,
      status: assignedTo ? 'Pending' : 'Not Assigned'
    });

    if (assignedTo) {
      const notif = await Notification.create({
        user: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned: ${title}`,
        type: 'task'
      });
      notifyUser(assignedTo, notif);
    }

    const populated = await Task.findById(task._id)
      .populate('event', 'name date')
      .populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, speciality, dueDate, priority, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo;
      task.status = assignedTo ? 'Pending' : 'Not Assigned';
    }
    if (speciality) task.speciality = speciality;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;

    await task.save();
    const populated = await Task.findById(task._id)
      .populate('event', 'name date')
      .populate('assignedTo', 'name email');
    res.json(populated);
  } catch (err) { next(err); }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'staff' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { getTasks, createTask, updateTask, updateTaskStatus, deleteTask };

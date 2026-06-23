const Event = require('../models/Event');
const Task = require('../models/Task');
const Guest = require('../models/Guest');
const BudgetItem = require('../models/BudgetItem');

const getEvents = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};

    if (req.user.role === 'organizer') {
      filter.organizer = req.user._id;
    } else if (req.user.role === 'staff') {
      filter.staffMembers = req.user._id;
    }

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .populate('venue', 'name location')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) { next(err); }
};

const createEvent = async (req, res, next) => {
  try {
    const { name, description, date, startTime, endTime, eventType, expectedGuests, dressCode, agenda, totalBudget } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });

    const event = await Event.create({
      name, description, date, startTime, endTime, eventType,
      expectedGuests, dressCode, agenda, totalBudget,
      organizer: req.user._id
    });
    res.status(201).json(event);
  } catch (err) { next(err); }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('venue', 'name location capacity pricing')
      .populate('staffMembers', 'name email phone');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('organizer', 'name email')
      .populate('venue', 'name location');
    res.json(updated);
  } catch (err) { next(err); }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) { next(err); }
};

const getEventDashboard = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('venue', 'name location');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const [tasks, guests, budgetItems] = await Promise.all([
      Task.find({ event: eventId }),
      Guest.find({ event: eventId }),
      BudgetItem.find({ event: eventId })
    ]);

    const totalPlanned = budgetItems.reduce((s, b) => s + b.plannedAmount, 0);
    const totalActual = budgetItems.reduce((s, b) => s + b.actualAmount, 0);

    const taskStats = {
      total: tasks.length,
      notAssigned: tasks.filter(t => t.status === 'Not Assigned').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: tasks.filter(t => t.status === 'Done').length
    };

    const guestStats = {
      total: guests.length,
      attending: guests.filter(g => g.rsvpStatus === 'Attending').length,
      notAttending: guests.filter(g => g.rsvpStatus === 'Not Attending').length,
      maybe: guests.filter(g => g.rsvpStatus === 'Maybe').length,
      pending: guests.filter(g => g.rsvpStatus === 'Pending').length,
      checkedIn: guests.filter(g => g.checkInStatus).length
    };

    res.json({ event, taskStats, guestStats, budget: { totalPlanned, totalActual, totalBudget: event.totalBudget } });
  } catch (err) { next(err); }
};

const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
};

const duplicateEvent = async (req, res, next) => {
  try {
    const source = await Event.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Event not found' });
    if (source.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const duplicate = await Event.create({
      name: `${source.name} (Copy)`,
      description: source.description,
      organizer: req.user._id,
      date: new Date(source.date.getTime() + 7 * 24 * 60 * 60 * 1000), // +1 week
      startTime: source.startTime,
      endTime: source.endTime,
      eventType: source.eventType,
      expectedGuests: source.expectedGuests,
      dressCode: source.dressCode,
      agenda: source.agenda,
      totalBudget: source.totalBudget,
      status: 'Planning',
    });

    // Duplicate tasks (without assignments)
    const tasks = await Task.find({ event: source._id });
    for (const t of tasks) {
      await Task.create({ event: duplicate._id, title: t.title, description: t.description, speciality: t.speciality, dueDate: t.dueDate, priority: t.priority, status: 'Not Assigned' });
    }

    // Duplicate budget items
    const budgetItems = await BudgetItem.find({ event: source._id });
    for (const b of budgetItems) {
      await BudgetItem.create({ event: duplicate._id, category: b.category, description: b.description, plannedAmount: b.plannedAmount, actualAmount: 0, notes: b.notes });
    }

    res.status(201).json(duplicate);
  } catch (err) { next(err); }
};

module.exports = { getEvents, createEvent, getEvent, updateEvent, deleteEvent, getEventDashboard, updateEventStatus, duplicateEvent };

const BudgetItem = require('../models/BudgetItem');
const Event = require('../models/Event');

const getBudget = async (req, res, next) => {
  try {
    const items = await BudgetItem.find({ event: req.params.eventId }).sort('category');
    const event = await Event.findById(req.params.eventId).select('totalBudget name');
    const totalPlanned = items.reduce((s, i) => s + i.plannedAmount, 0);
    const totalActual = items.reduce((s, i) => s + i.actualAmount, 0);
    res.json({ items, totalBudget: event?.totalBudget || 0, totalPlanned, totalActual, eventName: event?.name });
  } catch (err) { next(err); }
};

const createBudgetItem = async (req, res, next) => {
  try {
    const { category, description, plannedAmount, actualAmount, notes } = req.body;
    if (!category || plannedAmount === undefined) {
      return res.status(400).json({ message: 'Category and planned amount are required' });
    }
    const item = await BudgetItem.create({
      event: req.params.eventId, category, description, plannedAmount, actualAmount: actualAmount || 0, notes
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

const updateBudgetItem = async (req, res, next) => {
  try {
    const item = await BudgetItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Budget item not found' });
    const updated = await BudgetItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

const deleteBudgetItem = async (req, res, next) => {
  try {
    const item = await BudgetItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Budget item not found' });
    await item.deleteOne();
    res.json({ message: 'Budget item deleted' });
  } catch (err) { next(err); }
};

const updateEventBudget = async (req, res, next) => {
  try {
    const { totalBudget } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.eventId, { totalBudget }, { new: true });
    res.json({ totalBudget: event.totalBudget });
  } catch (err) { next(err); }
};

module.exports = { getBudget, createBudgetItem, updateBudgetItem, deleteBudgetItem, updateEventBudget };

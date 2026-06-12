const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const getInvoices = async (req, res, next) => {
  try {
    const { event, status } = req.query;
    const filter = {};

    if (req.user.role === 'vendor') filter.vendor = req.user._id;
    if (req.user.role === 'organizer') filter.organizer = req.user._id;
    if (event) filter.event = event;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('vendor', 'name email')
      .populate('organizer', 'name email')
      .populate('event', 'name date')
      .sort('-createdAt');
    res.json(invoices);
  } catch (err) { next(err); }
};

const createInvoice = async (req, res, next) => {
  try {
    const { organizer, event, sourcingRequest, items, totalAmount, itemizedBreakdown, notes, dueDate } = req.body;
    if (!organizer || !event || !items || !totalAmount) {
      return res.status(400).json({ message: 'Organizer, event, items, and total are required' });
    }

    const invoice = await Invoice.create({
      vendor: req.user._id, organizer, event, sourcingRequest,
      items, totalAmount, itemizedBreakdown, notes, dueDate
    });

    await Notification.create({
      user: organizer, title: 'New Invoice Submitted',
      message: `A new invoice of ${totalAmount} EGP has been submitted for review`,
      type: 'invoice'
    });

    res.status(201).json(invoice);
  } catch (err) { next(err); }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (req.user.role !== 'organizer') return res.status(403).json({ message: 'Only organizers can update invoice status' });

    invoice.status = status;
    await invoice.save();

    await Notification.create({
      user: invoice.vendor, title: `Invoice ${status}`,
      message: `Your invoice #${invoice.invoiceNumber} has been ${status.toLowerCase()}`,
      type: 'invoice'
    });

    res.json(invoice);
  } catch (err) { next(err); }
};

module.exports = { getInvoices, createInvoice, updateInvoiceStatus };

const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { log } = require('../services/activityLogger');

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

    log({ user: req.user._id, role: 'vendor', action: 'Invoice Submitted', entityType: 'Invoice', entityId: invoice._id, newStatus: 'Pending Review', description: `Submitted invoice of ${totalAmount} EGP for review`, metadata: { totalAmount } });

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

    // Send email to vendor
    const vendor = await User.findById(invoice.vendor);
    if (vendor?.email) {
      const populated = await Invoice.findById(invoice._id).populate('event', 'name');
      emailService.invoiceStatusUpdate({ vendorEmail: vendor.email, vendorName: vendor.name, invoiceNumber: invoice.invoiceNumber, amount: invoice.totalAmount, status, eventName: populated?.event?.name || 'Event', message: invoice.itemizedBreakdown }).catch(() => {});
    }

    log({ user: req.user._id, role: 'organizer', action: `Invoice ${status}`, entityType: 'Invoice', entityId: invoice._id, oldStatus: 'Pending Review', newStatus: status, description: `${status} invoice #${invoice.invoiceNumber} of ${invoice.totalAmount?.toLocaleString()} EGP`, metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.totalAmount } });

    res.json(invoice);
  } catch (err) { next(err); }
};

module.exports = { getInvoices, createInvoice, updateInvoiceStatus };

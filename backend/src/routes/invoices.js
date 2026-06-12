const router = require('express').Router();
const { getInvoices, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getInvoices);
router.post('/', authorize('vendor'), createInvoice);
router.patch('/:id/status', authorize('organizer'), updateInvoiceStatus);

module.exports = router;

const router = require('express').Router({ mergeParams: true });
const { getBudget, createBudgetItem, updateBudgetItem, deleteBudgetItem, updateEventBudget } = require('../controllers/budgetController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getBudget);
router.post('/', authorize('organizer'), createBudgetItem);
router.patch('/total', authorize('organizer'), updateEventBudget);
router.put('/:id', authorize('organizer'), updateBudgetItem);
router.delete('/:id', authorize('organizer'), deleteBudgetItem);

module.exports = router;

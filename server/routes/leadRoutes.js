const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');
const {
  createLeadValidator,
  updateLeadValidator,
  leadIdValidator,
} = require('../validators/leadValidators');
const { protect } = require('../middleware/auth');

// All lead routes are protected
router.use(protect);

router.route('/')
  .post(createLeadValidator, createLead)
  .get(getLeads);

router.route('/:id')
  .get(leadIdValidator, getLeadById)
  .put(updateLeadValidator, updateLead)
  .delete(leadIdValidator, deleteLead);

module.exports = router;

const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { leadSources, leadStatuses } = require('../models/Lead');

const createLeadValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1 234 567 8900)'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('source')
    .optional()
    .isIn(leadSources)
    .withMessage(`Source must be one of: ${leadSources.join(', ')}`),
  body('status')
    .optional()
    .isIn(leadStatuses)
    .withMessage(`Status must be one of: ${leadStatuses.join(', ')}`),
  validateRequest,
];

const updateLeadValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email address cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('source')
    .optional()
    .isIn(leadSources)
    .withMessage(`Source must be one of: ${leadSources.join(', ')}`),
  body('status')
    .optional()
    .isIn(leadStatuses)
    .withMessage(`Status must be one of: ${leadStatuses.join(', ')}`),
  validateRequest,
];

const leadIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
  validateRequest,
];

module.exports = {
  createLeadValidator,
  updateLeadValidator,
  leadIdValidator,
};

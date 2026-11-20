const Lead = require('../models/Lead');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, status } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company: company || '',
      source: source || 'Website',
      status: status || 'New',
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads for the authenticated user (with search, filter, sort, pagination)
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const {
      search,
      status,
      source,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Base query scoped strictly to the authenticated user
    const query = { user: req.user._id };

    // Search by Name, Email, or Company
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
      ];
    }

    // Filter by Status
    if (status && status !== 'all' && status.trim() !== '') {
      query.status = status;
    }

    // Filter by Source
    if (source && source !== 'all' && source.trim() !== '') {
      query.source = source;
    }

    // Sorting configuration
    const allowedSortFields = ['createdAt', 'name', 'status', 'company', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Run count and query in parallel for optimal response times
    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages,
      currentPage: pageNum,
      leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get individual lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you do not have permission to view it',
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, status } = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you do not have permission to modify it',
      });
    }

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (source !== undefined) lead.source = source;
    if (status !== undefined) lead.status = status;

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you do not have permission to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};

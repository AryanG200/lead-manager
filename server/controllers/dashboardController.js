const Lead = require('../models/Lead');

// @desc    Get dashboard statistics for the authenticated user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Calculate counts in parallel
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      lostLeads,
      recentLeads,
      statusBreakdown,
      sourceBreakdown,
    ] = await Promise.all([
      Lead.countDocuments({ user: userId }),
      Lead.countDocuments({ user: userId, status: 'New' }),
      Lead.countDocuments({ user: userId, status: 'Contacted' }),
      Lead.countDocuments({ user: userId, status: 'Qualified' }),
      Lead.countDocuments({ user: userId, status: 'Lost' }),
      Lead.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      Lead.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
    ]);

    // Format distribution arrays
    const formattedStatusDistribution = {
      New: newLeads,
      Contacted: contactedLeads,
      Qualified: qualifiedLeads,
      Lost: lostLeads,
    };

    const formattedSourceDistribution = sourceBreakdown.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        lostLeads,
      },
      statusDistribution: formattedStatusDistribution,
      sourceDistribution: formattedSourceDistribution,
      recentLeads,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};

// server/controllers/dashboardController.js
const Client = require('../models/Client');
const Program = require('../models/Program');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalClients = await Client.countDocuments();
    const totalPrograms = await Program.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    
    // Get recent clients (registered in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClients = await Client.countDocuments({
      dateRegistered: { $gte: thirtyDaysAgo }
    });
    
    // Get active programs
    const activePrograms = await Program.countDocuments({ active: true });
    
    // Get most popular programs (by enrollment count)
    const popularPrograms = await Client.aggregate([
      { $unwind: '$enrollments' },
      {
        $group: {
          _id: '$enrollments.program',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'program'
        }
      },
      {
        $project: {
          _id: 0,
          program: { $arrayElemAt: ['$program.name', 0] },
          count: 1
        }
      }
    ]);
    
    // Get recent enrollments
    const recentEnrollments = await Client.aggregate([
      { $unwind: '$enrollments' },
      { $match: { 'enrollments.enrollmentDate': { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: 'programs',
          localField: 'enrollments.program',
          foreignField: '_id',
          as: 'programDetails'
        }
      },
      {
        $project: {
          _id: 0,
          clientName: { $concat: ['$firstName', ' ', '$lastName'] },
          programName: { $arrayElemAt: ['$programDetails.name', 0] },
          enrollmentDate: '$enrollments.enrollmentDate'
        }
      },
      { $sort: { enrollmentDate: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        totalPrograms,
        totalDoctors,
        recentClients,
        activePrograms,
        popularPrograms,
        recentEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// server/routes/dashboardRoutes.js
const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All dashboard routes are protected
router.get('/', getDashboardStats);

module.exports = router;
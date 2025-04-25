const Program = require('../models/Program');
const Client = require('../models/Client');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ dateCreated: -1 });
    
    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Private
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private
exports.createProgram = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const program = await Program.create(req.body);
    
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private
exports.updateProgram = async (req, res) => {
  try {
    let program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    // Check if any clients are enrolled in this program
    const enrolledClients = await Client.find({
      'enrollments.program': req.params.id
    });
    
    if (enrolledClients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete program with active enrollments'
      });
    }
    
    await program.remove();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats for programs
// @route   GET /api/programs/stats
// @access  Private
exports.getProgramStats = async (req, res) => {
  try {
    // Get total number of programs
    const totalPrograms = await Program.countDocuments();
    
    // Get active programs
    const activePrograms = await Program.countDocuments({ active: true });
    
    // Get recent programs (created in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPrograms = await Program.countDocuments({
      dateCreated: { $gte: thirtyDaysAgo }
    });
    
    // Get the number of clients in each program
    const programEnrollments = await Client.aggregate([
      { $unwind: '$enrollments' },
      {
        $group: {
          _id: '$enrollments.program',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'programDetails'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          programName: { $arrayElemAt: ['$programDetails.name', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalPrograms,
        activePrograms,
        recentPrograms,
        programEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


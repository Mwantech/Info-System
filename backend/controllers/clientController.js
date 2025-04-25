const Client = require('../models/Client');
const Program = require('../models/Program');

// @desc    Get all clients with pagination
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    
    // Search query conditions
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { firstName: { $regex: searchQuery, $options: 'i' } },
          { lastName: { $regex: searchQuery, $options: 'i' } },
          { contactNumber: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }
    
    const total = await Client.countDocuments(query);
    
    const clients = await Client.find(query)
      .sort({ dateRegistered: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'enrollments.program',
        select: 'name description'
      });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: clients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate({
        path: 'enrollments.program',
        select: 'name description active'
      })
      .populate({
        path: 'registeredBy',
        select: 'name email'
      });
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  try {
    // Add registered by user to req.body
    req.body.registeredBy = req.user.id;
    
    const client = await Client.create(req.body);
    
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    await client.remove();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
exports.searchClients = async (req, res) => {
  try {
    const query = req.query.query || '';
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    const clients = await Client.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { contactNumber: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll client in a program
// @route   POST /api/clients/:id/programs
// @access  Private
exports.enrollClientInProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    
    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required'
      });
    }
    
    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Check if program is active
    if (!program.active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in inactive program'
      });
    }
    
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check if client is already enrolled in the program
    const isEnrolled = client.enrollments.some(
      enrollment => enrollment.program.toString() === programId
    );
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Client is already enrolled in this program'
      });
    }
    
    // Add enrollment
    client.enrollments.push({
      program: programId,
      enrollmentDate: new Date(),
      status: 'active'
    });
    
    await client.save();
    
    // Populate program details for response
    const updatedClient = await Client.findById(req.params.id)
      .populate({
        path: 'enrollments.program',
        select: 'name description'
      });
    
    res.status(200).json({
      success: true,
      data: updatedClient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove client from a program
// @route   DELETE /api/clients/:id/programs/:programId
// @access  Private
exports.removeClientFromProgram = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check if client is enrolled in the program
    const enrollmentIndex = client.enrollments.findIndex(
      enrollment => enrollment.program.toString() === req.params.programId
    );
    
    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Client is not enrolled in this program'
      });
    }
    
    // Remove enrollment
    client.enrollments.splice(enrollmentIndex, 1);
    
    await client.save();
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update client's program enrollment status
// @route   PUT /api/clients/:id/programs/:programId
// @access  Private
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'completed', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Find the specific enrollment
    const enrollment = client.enrollments.find(
      e => e.program.toString() === req.params.programId
    );
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Update status
    enrollment.status = status;
    
    await client.save();
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

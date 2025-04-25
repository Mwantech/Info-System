const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  contactNumber: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  enrollments: [
    {
      program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
      },
      enrollmentDate: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'withdrawn'],
        default: 'active'
      }
    }
  ],
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateRegistered: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', ClientSchema);
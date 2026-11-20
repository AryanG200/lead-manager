const mongoose = require('mongoose');

const leadSources = [
  'Website',
  'LinkedIn',
  'Referral',
  'Social Media',
  'Advertisement',
  'Cold Calling',
  'Other',
];

const leadStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/,
        'Please provide a valid phone number',
      ],
    },
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: leadSources,
        message: '{VALUE} is not a valid lead source',
      },
      default: 'Website',
    },
    status: {
      type: String,
      required: [true, 'Lead status is required'],
      enum: {
        values: leadStatuses,
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal query performance
leadSchema.index({ user: 1, createdAt: -1 });
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, name: 1 });

// Clean response representation
leadSchema.methods.toJSON = function () {
  const lead = this.toObject();
  delete lead.__v;
  return lead;
};

module.exports = mongoose.model('Lead', leadSchema);
module.exports.leadSources = leadSources;
module.exports.leadStatuses = leadStatuses;

const mongoose = require('mongoose')

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },

    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },

    category: {
      type: String,
      default: 'General',
      maxlength: 100,
    },

    dueDate: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value),
        message: 'dueDate must be a calendar date in YYYY-MM-DD format',
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Task', taskSchema)

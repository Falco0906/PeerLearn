const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    answers: [
      {
        text: {
          type: String,
          required: true,
          maxlength: [1000, 'Answer cannot exceed 1000 characters']
        },
        answeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        likes: {
          type: Number,
          default: 0
        },
        likedBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
        ],
        isAccepted: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isResolved: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
qaSchema.index({ video: 1, isResolved: 1 });
qaSchema.index({ askedBy: 1 });
qaSchema.index({ status: 1 });

module.exports = mongoose.model('QA', qaSchema);
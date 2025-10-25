const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a video title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required']
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    duration: {
      type: Number, // in seconds
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      enum: ['Mathematics', 'Science', 'History', 'English', 'Programming', 'Other'],
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    transcript: {
      type: String,
      default: null
    },
    summary: {
      type: String,
      default: null
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    qaSection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QA'
      }
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public'
    },
    isProcessing: {
      type: Boolean,
      default: true // true when transcript/summary is being generated
    },
    fileSize: {
      type: Number // in bytes
    },
    processingStatus: {
      transcript: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      summary: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      }
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for faster searches
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ subject: 1, topic: 1 });
videoSchema.index({ uploader: 1 });

module.exports = mongoose.model('Video', videoSchema);

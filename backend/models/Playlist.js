const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a playlist title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    thumbnailUrl: {
      type: String,
      default: null
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
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    viewCount: {
      type: Number,
      default: 0
    },
    isCurated: {
      type: Boolean,
      default: false // for official/curated playlists aligned with KLH syllabus
    },
    syllabusCourse: {
      type: String,
      default: null // e.g., "CSE101", "MATH201"
    }
  },
  {
    timestamps: true
  }
);

// Index for searching
playlistSchema.index({ title: 'text', description: 'text', tags: 'text' });
playlistSchema.index({ creator: 1, subject: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);

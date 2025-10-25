const express = require('express');
const Comment = require('../models/Comment');
const Video = require('../models/videoModel');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get comments for a video
router.get('/video/:videoId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: req.params.videoId, parentComment: null })
      .populate('author', 'name profileImage email')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'name profileImage email' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ video: req.params.videoId, parentComment: null });

    res.json({
      comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post(
  '/',
  verifyToken,
  [
    body('text').notEmpty().withMessage('Comment text is required'),
    body('videoId').notEmpty().withMessage('Video ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text, videoId, parentCommentId = null } = req.body;

      // Check if video exists
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const comment = new Comment({
        text,
        author: req.userId,
        video: videoId,
        parentComment: parentCommentId
      });

      await comment.save();
      await comment.populate('author', 'name profileImage email');

      // Add comment to video
      if (!parentCommentId) {
        await Video.findByIdAndUpdate(videoId, { $push: { comments: comment._id } });
      } else {
        // Add reply to parent comment
        await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: comment._id } });
      }

      res.status(201).json({
        message: 'Comment added successfully',
        comment
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update comment
router.put(
  '/:commentId',
  verifyToken,
  [
    body('text').notEmpty().withMessage('Comment text is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the author
      if (comment.author.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      comment.text = req.body.text;
      comment.isEdited = true;
      comment.editedAt = new Date();

      await comment.save();
      await comment.populate('author', 'name profileImage email');

      res.json({
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author or an admin
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment from video
    if (!comment.parentComment) {
      await Video.findByIdAndUpdate(comment.video, { $pull: { comments: comment._id } });
    } else {
      // Remove from parent comment replies
      await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: comment._id } });
    }

    // Delete all replies if this is a parent comment
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like comment
router.post('/:commentId/like', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likedBy.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      comment.likedBy.splice(likeIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(req.userId);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

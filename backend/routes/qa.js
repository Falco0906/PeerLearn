const express = require('express');
const QA = require('../models/QA');
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

// Get Q&A for a video
router.get('/video/:videoId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'open' } = req.query;
    const skip = (page - 1) * limit;

    const filter = { video: req.params.videoId };
    if (status) filter.status = status;

    const questions = await QA.find(filter)
      .populate('askedBy', 'name profileImage email')
      .populate('answers.answeredBy', 'name profileImage email')
      .sort({ isResolved: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await QA.countDocuments(filter);

    res.json({
      questions,
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

// Ask a question
router.post(
  '/',
  verifyToken,
  [
    body('question').notEmpty().withMessage('Question is required'),
    body('videoId').notEmpty().withMessage('Video ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { question, videoId, tags = [], priority = 'medium' } = req.body;

      // Check if video exists
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const qa = new QA({
        question,
        askedBy: req.userId,
        video: videoId,
        tags: tags.split(',').map(t => t.trim()),
        priority
      });

      await qa.save();
      await qa.populate('askedBy', 'name profileImage email');

      // Add to video's QA section
      await Video.findByIdAndUpdate(videoId, { $push: { qaSection: qa._id } });

      res.status(201).json({
        message: 'Question added successfully',
        qa
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Answer a question
router.post(
  '/:qaId/answer',
  verifyToken,
  [
    body('text').notEmpty().withMessage('Answer text is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text } = req.body;

      const qa = await QA.findById(req.params.qaId);
      if (!qa) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const answer = {
        text,
        answeredBy: req.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      qa.answers.push(answer);
      qa.status = qa.status === 'open' ? 'answered' : qa.status;

      await qa.save();
      await qa.populate('answers.answeredBy', 'name profileImage email');

      res.status(201).json({
        message: 'Answer added successfully',
        qa
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Mark answer as accepted
router.post(
  '/:qaId/accept-answer/:answerId',
  verifyToken,
  async (req, res) => {
    try {
      const qa = await QA.findById(req.params.qaId);
      if (!qa) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Check if user is the question asker
      if (qa.askedBy.toString() !== req.userId) {
        return res.status(403).json({ message: 'Only question asker can accept answers' });
      }

      // Find and update answer
      const answerIndex = qa.answers.findIndex(a => a._id.toString() === req.params.answerId);
      if (answerIndex === -1) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      qa.answers[answerIndex].isAccepted = true;
      qa.acceptedAnswer = qa.answers[answerIndex]._id;
      qa.isResolved = true;
      qa.status = 'closed';

      await qa.save();
      await qa.populate('answers.answeredBy', 'name profileImage email');

      res.json({
        message: 'Answer accepted successfully',
        qa
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Like an answer
router.post('/:qaId/answer/:answerId/like', verifyToken, async (req, res) => {
  try {
    const qa = await QA.findById(req.params.qaId);
    if (!qa) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = qa.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const likeIndex = answer.likedBy.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      answer.likedBy.splice(likeIndex, 1);
      answer.likes = Math.max(0, answer.likes - 1);
    } else {
      // Like
      answer.likedBy.push(req.userId);
      answer.likes += 1;
    }

    await qa.save();

    res.json({
      message: likeIndex > -1 ? 'Answer unliked' : 'Answer liked',
      likes: answer.likes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question
router.get('/:qaId', async (req, res) => {
  try {
    const qa = await QA.findByIdAndUpdate(
      req.params.qaId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('askedBy', 'name profileImage email')
      .populate('answers.answeredBy', 'name profileImage email');

    if (!qa) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(qa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update question
router.put(
  '/:qaId',
  verifyToken,
  [
    body('question').notEmpty().withMessage('Question is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const qa = await QA.findById(req.params.qaId);
      if (!qa) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Check if user is the asker
      if (qa.askedBy.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to update this question' });
      }

      qa.question = req.body.question;
      await qa.save();
      await qa.populate('askedBy', 'name profileImage email');

      res.json({
        message: 'Question updated successfully',
        qa
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete question
router.delete('/:qaId', verifyToken, async (req, res) => {
  try {
    const qa = await QA.findById(req.params.qaId);
    if (!qa) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the asker
    if (qa.askedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Remove from video
    await Video.findByIdAndUpdate(qa.video, { $pull: { qaSection: qa._id } });

    await QA.findByIdAndDelete(req.params.qaId);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

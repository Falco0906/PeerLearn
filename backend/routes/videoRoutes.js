const express = require('express');
const Video = require('../models/videoModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/videos'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

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

// Get all videos with filters
router.get('/', async (req, res) => {
  try {
    const { search, subject, topic, page = 1, limit = 20 } = req.query;
    const filter = { visibility: 'public', isProcessing: false };

    if (search) {
      filter.$text = { $search: search };
    }
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;

    const skip = (page - 1) * limit;

    const videos = await Video.find(filter)
      .populate('uploader', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      videos,
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

// Get video by ID
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.videoId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('uploader', 'name profileImage email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name profileImage' }
      })
      .populate({
        path: 'qaSection',
        populate: [
          { path: 'askedBy', select: 'name profileImage' },
          { path: 'answers.answeredBy', select: 'name profileImage' }
        ]
      });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload video
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { title, description, subject, topic, tags = [] } = req.body;

    if (!title || !description || !subject || !topic) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const video = new Video({
      title,
      description,
      subject,
      topic,
      tags: tags.split(',').map(t => t.trim()),
      uploader: req.userId,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: null,
      duration: 0,
      isProcessing: true
    });

    await video.save();

    // Add to user's uploaded videos
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { uploadedVideos: video._id } }
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update video
router.put('/:videoId', verifyToken, async (req, res) => {
  try {
    let video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the uploader
    if (video.uploader.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    const { title, description, subject, topic, tags, visibility } = req.body;

    video.title = title || video.title;
    video.description = description || video.description;
    video.subject = subject || video.subject;
    video.topic = topic || video.topic;
    video.visibility = visibility || video.visibility;
    if (tags) video.tags = tags.split(',').map(t => t.trim());

    await video.save();

    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete video
router.delete('/:videoId', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.uploader.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await Video.findByIdAndDelete(req.params.videoId);

    // Remove from user's uploaded videos
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { uploadedVideos: req.params.videoId } }
    );

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike video
router.post('/:videoId/like', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const likeIndex = video.likedBy.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      video.likedBy.splice(likeIndex, 1);
      video.likes = Math.max(0, video.likes - 1);
      await video.save();
      return res.json({ message: 'Video unliked', likes: video.likes });
    } else {
      // Like
      video.likedBy.push(req.userId);
      video.likes += 1;
      await video.save();
      return res.json({ message: 'Video liked', likes: video.likes });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get videos by uploader
router.get('/uploader/:uploaderId', async (req, res) => {
  try {
    const videos = await Video.find({
      uploader: req.params.uploaderId,
      visibility: 'public'
    })
      .populate('uploader', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

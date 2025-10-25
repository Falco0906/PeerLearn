const express = require('express');
const Playlist = require('../models/Playlist');
const Video = require('../models/videoModel');
const User = require('../models/userModel');
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

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const { subject, topic, search, creator, isCurated } = req.query;
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (topic) query.topic = { $regex: topic, $options: 'i' };
    if (creator) query.creator = creator;
    if (isCurated !== undefined) query.isCurated = isCurated === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const playlists = await Playlist.find(query)
      .populate('creator', 'name email profileImage')
      .populate('videos', 'title thumbnailUrl duration views likes subject topic')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single playlist
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('creator', 'name email profileImage')
      .populate({
        path: 'videos',
        select: 'title description thumbnailUrl videoUrl duration views likes subject topic uploader createdAt tags',
        populate: {
          path: 'uploader',
          select: 'name email profileImage'
        }
      })
      .populate('followers', 'name email profileImage');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Increment view count
    await Playlist.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create playlist
router.post('/', verifyToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('topic').notEmpty().withMessage('Topic is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, topic, tags = [], videos = [], visibility = 'public', isCurated = false, syllabusCourse } = req.body;

    const playlist = new Playlist({
      title,
      description,
      subject,
      topic,
      tags: tags.split(',').map(t => t.trim()),
      videos: videos,
      creator: req.userId,
      visibility,
      isCurated,
      syllabusCourse
    });

    await playlist.save();
    await playlist.populate('creator', 'name email profileImage');

    // Add to user's created playlists
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { createdPlaylists: playlist._id } }
    );

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update playlist
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the creator
    if (playlist.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }

    const { title, description, subject, topic, tags, videos, visibility, isCurated, syllabusCourse } = req.body;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        subject,
        topic,
        tags: tags ? tags.split(',').map(t => t.trim()) : playlist.tags,
        videos: videos || playlist.videos,
        visibility,
        isCurated,
        syllabusCourse
      },
      { new: true }
    ).populate('creator', 'name email profileImage')
     .populate('videos', 'title thumbnailUrl duration views likes subject topic');

    res.json({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete playlist
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the creator
    if (playlist.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    // Remove from user's created playlists
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { createdPlaylists: req.params.id } }
    );

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add video to playlist
router.post('/:id/videos', verifyToken, [
  body('videoId').notEmpty().withMessage('Video ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the creator
    if (playlist.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({ message: 'Video already in playlist' });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $push: { videos: videoId } },
      { new: true }
    ).populate('creator', 'name email profileImage')
     .populate('videos', 'title thumbnailUrl duration views likes subject topic');

    res.json({
      message: 'Video added to playlist successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove video from playlist
router.delete('/:id/videos/:videoId', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the creator
    if (playlist.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $pull: { videos: req.params.videoId } },
      { new: true }
    ).populate('creator', 'name email profileImage')
     .populate('videos', 'title thumbnailUrl duration views likes subject topic');

    res.json({
      message: 'Video removed from playlist successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow/Unfollow playlist
router.post('/:id/follow', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const isFollowing = playlist.followers.includes(req.userId);

    if (isFollowing) {
      // Unfollow
      await Playlist.findByIdAndUpdate(
        req.params.id,
        { $pull: { followers: req.userId } }
      );
      res.json({ message: 'Unfollowed playlist successfully', following: false });
    } else {
      // Follow
      await Playlist.findByIdAndUpdate(
        req.params.id,
        { $push: { followers: req.userId } }
      );
      res.json({ message: 'Following playlist successfully', following: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's playlists
router.get('/user/:userId', async (req, res) => {
  try {
    const playlists = await Playlist.find({ creator: req.params.userId })
      .populate('creator', 'name email profileImage')
      .populate('videos', 'title thumbnailUrl duration views likes subject topic')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get curated playlists (official KLH syllabus playlists)
router.get('/curated/all', async (req, res) => {
  try {
    const playlists = await Playlist.find({ isCurated: true })
      .populate('creator', 'name email profileImage')
      .populate('videos', 'title thumbnailUrl duration views likes subject topic')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('universityId').matches(/^KLH\d{3,}$/).withMessage('Invalid university ID format'),
    body('department').notEmpty().withMessage('Department is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, universityId, department } = req.body;

      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { universityId }] });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        universityId,
        department,
        role: 'student'
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('uploadedVideos')
      .populate('playlists');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'uploadedVideos',
        select: 'title thumbnailUrl views likes createdAt'
      })
      .populate({
        path: 'playlists',
        select: 'title videos createdAt'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hide sensitive information
    const userObj = user.toJSON();
    delete userObj.password;
    delete userObj.verificationToken;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put(
  '/update/:userId',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('department').optional().notEmpty().withMessage('Department cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id !== req.params.userId) {
        return res.status(403).json({ message: 'Not authorized to update this profile' });
      }

      const { name, bio, department, profileImage } = req.body;

      let user = await User.findByIdAndUpdate(
        req.params.userId,
        { name, bio, department, profileImage },
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Profile updated successfully',
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all users (for admin/statistics)
router.get('/list/all', async (req, res) => {
  try {
    const { department, role } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password -verificationToken')
      .limit(100);

    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

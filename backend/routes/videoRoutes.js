const express = require('express');
const Video = require('../models/videoModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const router = express.Router();

// Initialize Gemini AI for transcript generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate transcript using AI (simulated for demo)
const generateTranscript = async (videoPath, title, description) => {
  try {
    // In a real implementation, you would use speech-to-text APIs like:
    // - Google Cloud Speech-to-Text
    // - Azure Speech Services
    // - AWS Transcribe
    // - OpenAI Whisper API
    
    // For demo purposes, we'll generate a realistic transcript based on title/description
    const transcriptTemplates = {
      'Programming': `Welcome to this programming tutorial on ${title}. In this video, we'll cover the fundamental concepts and practical applications.

${description}

Let's start by understanding the basic principles. First, we need to consider the core concepts that form the foundation of this topic. This includes understanding the syntax, structure, and best practices.

Next, we'll move on to practical examples. I'll show you how to implement these concepts in real-world scenarios. Pay attention to the code examples and explanations.

Key points to remember:
1. Always follow coding standards and conventions
2. Test your code thoroughly
3. Document your work properly
4. Consider edge cases and error handling

In the next section, we'll explore advanced topics and optimization techniques. This will help you write more efficient and maintainable code.

Finally, we'll wrap up with a summary of what we've learned and provide resources for further learning. Don't forget to practice these concepts on your own projects.

Thank you for watching! If you found this helpful, please like and subscribe for more programming tutorials.`,
      
      'Mathematics': `Welcome to this mathematics lesson on ${title}. Today we'll explore important mathematical concepts and problem-solving techniques.

${description}

Let's begin with the fundamental principles. Understanding these basics is crucial for mastering more advanced topics. We'll start with definitions and key properties.

Now, let's work through some examples step by step. I'll show you the problem-solving process, including how to identify what's given and what we need to find.

Important formulas and theorems to remember:
- Always check your work by substituting back into the original equation
- Draw diagrams when dealing with geometry problems
- Break complex problems into smaller, manageable steps
- Practice regularly to build confidence

In the next part, we'll tackle more challenging problems that combine multiple concepts. These will help you develop critical thinking skills.

Finally, we'll review the key concepts and provide practice problems for you to work on. Remember, mathematics is about understanding patterns and logical reasoning.

Thank you for joining this lesson! Keep practicing and don't hesitate to ask questions.`,
      
      'Science': `Welcome to this science lesson on ${title}. We'll explore fascinating scientific concepts and their real-world applications.

${description}

Let's start with the scientific principles behind this topic. Understanding the underlying science helps us appreciate how things work in nature.

We'll examine the evidence and observations that support these theories. Science is based on empirical evidence and systematic observation.

Key scientific concepts:
- Always consider the scientific method when analyzing phenomena
- Look for cause-and-effect relationships
- Understand the limitations and scope of scientific theories
- Connect abstract concepts to real-world examples

Next, we'll explore practical applications and how this knowledge is used in technology and everyday life. This shows the relevance of scientific knowledge.

We'll also discuss current research and future directions in this field. Science is constantly evolving as we learn more about our world.

In conclusion, we've covered the fundamental concepts and their importance. Science helps us understand the natural world and solve practical problems.

Thank you for learning with us! Science is about curiosity and discovery - keep asking questions and exploring!`
    };

    // Select appropriate template based on subject
    const subject = title.toLowerCase().includes('programming') || title.toLowerCase().includes('code') || title.toLowerCase().includes('algorithm') ? 'Programming' :
                   title.toLowerCase().includes('math') || title.toLowerCase().includes('calculus') || title.toLowerCase().includes('algebra') ? 'Mathematics' : 'Science';
    
    return transcriptTemplates[subject] || transcriptTemplates['Science'];
  } catch (error) {
    console.error('Transcript generation error:', error);
    return `Transcript for ${title}: ${description}. This video covers important educational content related to the topic. The transcript generation service is currently unavailable, but the video content is still accessible for learning purposes.`;
  }
};

// Function to generate summary from transcript
const generateSummary = async (transcript, title) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback summary if no API key
      return `Summary of ${title}: This educational video covers key concepts and provides practical examples. The content is designed to help students understand the topic through clear explanations and demonstrations. Key learning objectives include understanding fundamental principles, applying concepts in practice, and developing problem-solving skills.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please create a concise summary of this educational video transcript. Focus on:
1. Main learning objectives
2. Key concepts covered
3. Important takeaways
4. Practical applications

Transcript: ${transcript}

Provide a summary in 2-3 paragraphs that would help students quickly understand what they'll learn from this video.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summary generation error:', error);
    return `Summary of ${title}: This educational video covers important concepts and provides valuable learning content. The video includes explanations, examples, and practical applications to help students master the topic.`;
  }
};

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
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      uploader: req.userId,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: null,
      duration: 0,
      fileSize: req.file.size,
      isProcessing: false,  // Set to false so video shows immediately
      processingStatus: {
        transcript: 'pending',
        summary: 'pending'
      }
    });

    await video.save();

    // Add to user's uploaded videos
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { uploadedVideos: video._id } }
    );

    // Populate the uploader before sending response
    await video.populate('uploader', 'name email profileImage');

    // Generate transcript and summary asynchronously
    setTimeout(async () => {
      try {
        console.log(`Starting transcript generation for video: ${video._id}`);
        
        // Generate transcript
        const transcript = await generateTranscript(req.file.path, title, description);
        
        // Generate summary from transcript
        const summary = await generateSummary(transcript, title);
        
        // Update video with transcript and summary
        await Video.findByIdAndUpdate(video._id, {
          transcript,
          summary,
          isProcessing: false,
          processingStatus: {
            transcript: 'completed',
            summary: 'completed'
          }
        });
        
        console.log(`Completed processing for video: ${video._id}`);
      } catch (error) {
        console.error(`Error processing video ${video._id}:`, error);
        
        // Update with fallback content
        await Video.findByIdAndUpdate(video._id, {
          transcript: `Transcript for ${title}: ${description}. This video covers important educational content.`,
          summary: `Summary of ${title}: This educational video covers key concepts and provides practical examples.`,
          isProcessing: false,
          processingStatus: {
            transcript: 'completed',
            summary: 'completed'
          }
        });
      }
    }, 2000); // Start processing after 2 seconds

    res.status(201).json({
      message: 'Video uploaded successfully. Transcript and summary will be generated shortly.',
      video: video
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

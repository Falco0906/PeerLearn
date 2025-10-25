const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Video = require('../models/videoModel');
const Playlist = require('../models/Playlist');
const User = require('../models/userModel');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chatbot endpoint
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Get platform context
    const videos = await Video.find({ isProcessing: false })
      .select('title description subject topic tags views likes')
      .limit(20)
      .sort({ views: -1 });

    const playlists = await Playlist.find()
      .select('name description videos')
      .populate('videos', 'title subject topic')
      .limit(10);

    const subjects = [...new Set(videos.map(v => v.subject))];
    const topics = [...new Set(videos.flatMap(v => v.topic))];

    // Create context for the AI
    const platformContext = `
KLH Peer Learning Platform Context:
- Total Videos: ${videos.length}
- Available Subjects: ${subjects.join(', ')}
- Popular Topics: ${topics.slice(0, 10).join(', ')}
- Playlists: ${playlists.map(p => p.name).join(', ')}

Recent Videos:
${videos.slice(0, 5).map(v => `- ${v.title} (${v.subject}) - ${v.views} views`).join('\n')}

Available Playlists:
${playlists.map(p => `- ${p.name}: ${p.videos.length} videos`).join('\n')}
`;

    const systemPrompt = `You are KLH AI Assistant, a helpful chatbot for the KLH Peer Learning Platform. 
Your role is to assist students and faculty in:
1. Finding relevant educational videos and playlists
2. Suggesting study paths based on subjects/topics
3. Answering questions about platform features
4. Helping with navigation and content discovery

IMPORTANT RULES:
- Only provide information about the platform's content and features
- Be helpful, friendly, and educational
- Suggest specific videos or playlists when relevant
- If asked about topics not covered in the platform, politely redirect to available content
- Always encourage learning and collaboration

Platform Context:
${platformContext}

User Question: ${message}

Provide a helpful response focusing on the platform's content and features.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback response if Gemini API fails
    const fallbackResponse = `I'm here to help you navigate the KLH Peer Learning Platform! 

I can assist you with:
- Finding videos by subject or topic
- Suggesting study playlists
- Explaining platform features
- Helping with content discovery

What would you like to know about our educational content?`;

    res.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      error: 'AI service temporarily unavailable'
    });
  }
});

// Get platform statistics for chatbot context
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments({ isProcessing: false });
    const totalPlaylists = await Playlist.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const subjects = await Video.distinct('subject', { isProcessing: false });
    const topics = await Video.distinct('topic', { isProcessing: false });

    res.json({
      totalVideos,
      totalPlaylists,
      totalUsers,
      subjects,
      topics: topics.slice(0, 20) // Limit to most common topics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search suggestions endpoint
router.get('/suggestions', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Search videos
    const videos = await Video.find({
      $and: [
        { isProcessing: false },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { subject: { $regex: query, $options: 'i' } },
            { topic: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('title subject topic')
    .limit(5);

    // Search playlists
    const playlists = await Playlist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name description')
    .limit(3);

    const suggestions = [
      ...videos.map(v => ({
        type: 'video',
        title: v.title,
        subtitle: `${v.subject} - ${v.topic}`,
        id: v._id
      })),
      ...playlists.map(p => ({
        type: 'playlist',
        title: p.name,
        subtitle: p.description,
        id: p._id
      }))
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

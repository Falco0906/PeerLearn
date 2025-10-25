const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/comments');
const qaRoutes = require('./routes/qa');
const chatbotRoutes = require('./routes/chatbot');
const playlistRoutes = require('./routes/playlists');
const errorHandler = require('./middleware/errorHandler');

// Configure CORS - Allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Log CORS requests for debugging
  console.log('CORS Request:', req.method, req.path, 'Origin:', req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Helmet with CORS-friendly settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom video streaming with Range support
const fs = require('fs');

app.get('/uploads/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', 'videos', filename);

  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Set MIME type
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.webm': 'video/webm'
  };
  const contentType = mimeTypes[ext] || 'video/mp4';

  if (range) {
    // Parse range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filepath, { start, end });
    
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // No range, send entire file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    };
    
    res.writeHead(200, head);
    fs.createReadStream(filepath).pipe(res);
  }
});

// Serve other static files (thumbnails, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/playlists', playlistRoutes);

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KLH Peer Learning Backend is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB'
  });
});

// Database connection with better error handling
console.log('🔗 Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
})
.catch((error) => {
  console.error('❌ FAILED: MongoDB connection error:');
  console.error('   Error message:', error.message);
  console.log('💡 Check your MONGODB_URI in .env file');
});

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('🗄️  MongoDB event: Connected');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB event: Error -', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB event: Disconnected');
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎓 KLH Peer Learning Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🌐 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected 🟢' : 'Disconnected 🔴'}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed.');
  process.exit(0);
});
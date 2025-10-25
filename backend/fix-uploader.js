const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Video = require('./models/videoModel');
const User = require('./models/userModel');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find the video with null uploader
    const video = await Video.findOne({ uploader: null });
    
    if (!video) {
      console.log('No video found with null uploader');
      process.exit(0);
    }
    
    console.log(`Found video: ${video.title} (ID: ${video._id})`);
    
    // Find any user (preferably the one who should have uploaded it)
    const user = await User.findOne({ email: /faisal/i }) || await User.findOne();
    
    if (!user) {
      console.log('No user found!');
      process.exit(1);
    }
    
    console.log(`Assigning to user: ${user.name} (${user.email})`);
    
    // Update the video
    video.uploader = user._id;
    video.isProcessing = false;
    await video.save();
    
    // Add to user's uploaded videos if not already there
    if (!user.uploadedVideos.includes(video._id)) {
      user.uploadedVideos.push(video._id);
      await user.save();
    }
    
    console.log('✅ Video uploader fixed!');
    console.log(`   Video: ${video.title}`);
    console.log(`   Uploader: ${user.name}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

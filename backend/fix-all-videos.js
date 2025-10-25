const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Video = require('./models/videoModel');
const User = require('./models/userModel');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find ALL videos
    const videos = await Video.find({}).populate('uploader');
    console.log(`\nFound ${videos.length} total videos`);
    
    // Find any valid user
    const users = await User.find({});
    console.log(`Found ${users.length} total users`);
    
    if (users.length === 0) {
      console.log('❌ No users found!');
      process.exit(1);
    }
    
    const defaultUser = users[0];
    console.log(`\nDefault user: ${defaultUser.name} (${defaultUser.email})`);
    
    // Fix all videos with null or missing uploader
    let fixed = 0;
    for (const video of videos) {
      if (!video.uploader) {
        console.log(`\nFixing: "${video.title}" (ID: ${video._id})`);
        
        await Video.findByIdAndUpdate(video._id, {
          uploader: defaultUser._id,
          isProcessing: false
        });
        
        // Add to user's uploaded videos
        if (!defaultUser.uploadedVideos.includes(video._id)) {
          defaultUser.uploadedVideos.push(video._id);
        }
        
        fixed++;
        console.log(`  ✅ Assigned to ${defaultUser.name}`);
      }
    }
    
    if (fixed > 0) {
      await defaultUser.save();
      console.log(`\n🎉 Fixed ${fixed} video(s)!`);
    } else {
      console.log('\n✅ All videos already have uploaders!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

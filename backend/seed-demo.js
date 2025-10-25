const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/userModel');
const Video = require('./models/videoModel');
const Comment = require('./models/Comment');
const QA = require('./models/QA');
const Playlist = require('./models/Playlist');

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected for seeding'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed demo data...');

    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    await QA.deleteMany({});
    await Playlist.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create demo users
    const users = await User.create([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@klh.edu.in',
        password: 'password123',
        universityId: 'KLH001',
        department: 'Engineering',
        role: 'faculty'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@klh.edu.in',
        password: 'password123',
        universityId: 'KLH202',
        department: 'Engineering',
        role: 'student'
      },
      {
        name: 'Arjun Patel',
        email: 'arjun.patel@klh.edu.in',
        password: 'password123',
        universityId: 'KLH303',
        department: 'Engineering',
        role: 'student'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@klh.edu.in',
        password: 'password123',
        universityId: 'KLH404',
        department: 'Science',
        role: 'student'
      }
    ]);
    console.log('✅ Created 4 demo users');

    // Create demo videos
    const videos = await Video.create([
      {
        title: 'Introduction to Data Structures - Arrays and Linked Lists',
        description: 'Comprehensive explanation of fundamental data structures including arrays, dynamic arrays, and linked lists with practical examples and time complexity analysis.',
        subject: 'Programming',
        topic: 'Data Structures',
        uploader: users[0]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        videoPath: '/uploads/videos/demo-video-1.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video1/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-1.jpg',
        duration: 1845,
        fileSize: 125000000,
        visibility: 'public',
        isProcessing: false,
        views: 234,
        likes: 45,
        transcript: 'Hello everyone, today we will learn about data structures. Arrays are contiguous memory locations that store elements of the same type. Linked lists, on the other hand, use pointers to connect elements dynamically...',
        summary: 'This video covers the basics of arrays and linked lists, explaining their structure, operations (insertion, deletion, traversal), time complexities, and real-world applications.'
      },
      {
        title: 'Object-Oriented Programming Concepts in Java',
        description: 'Deep dive into OOP principles: Encapsulation, Inheritance, Polymorphism, and Abstraction with Java code examples.',
        subject: 'Programming',
        topic: 'Object-Oriented Programming',
        uploader: users[1]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
        videoPath: '/uploads/videos/demo-video-2.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video2/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-2.jpg',
        duration: 2160,
        fileSize: 145000000,
        visibility: 'public',
        isProcessing: false,
        views: 189,
        likes: 38,
        transcript: 'Welcome to OOP in Java. Encapsulation is the bundling of data and methods that operate on that data. We use access modifiers like private, public, and protected...',
        summary: 'Comprehensive guide to OOP in Java covering all four pillars with practical coding examples and best practices.'
      },
      {
        title: 'Database Normalization - 1NF, 2NF, 3NF, BCNF',
        description: 'Complete tutorial on database normalization techniques to eliminate redundancy and improve data integrity.',
        subject: 'Programming',
        topic: 'Database Management',
        uploader: users[0]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_3mb.mp4',
        videoPath: '/uploads/videos/demo-video-3.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video3/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-3.jpg',
        duration: 1920,
        fileSize: 132000000,
        visibility: 'public',
        isProcessing: false,
        views: 156,
        likes: 32,
        transcript: 'Database normalization is the process of organizing data to minimize redundancy. First Normal Form requires atomic values in each cell...',
        summary: 'Step-by-step explanation of normalization forms with examples of table decomposition and dependency analysis.'
      },
      {
        title: 'Computer Networks - OSI Model Explained',
        description: 'Detailed explanation of all 7 layers of the OSI model with protocols and real-world examples.',
        subject: 'Programming',
        topic: 'Computer Networks',
        uploader: users[2]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4',
        videoPath: '/uploads/videos/demo-video-4.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video4/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-4.jpg',
        duration: 2400,
        fileSize: 168000000,
        visibility: 'public',
        isProcessing: false,
        views: 201,
        likes: 41,
        transcript: 'The OSI model has 7 layers. Starting from the bottom: Physical layer deals with transmission of raw bits. Data Link layer handles error detection and MAC addresses...',
        summary: 'Complete overview of OSI model layers, protocols at each layer, and how data flows through the network stack.'
      },
      {
        title: 'Machine Learning Basics - Linear Regression',
        description: 'Introduction to supervised learning with linear regression, gradient descent, and cost function optimization.',
        subject: 'Mathematics',
        topic: 'Machine Learning',
        uploader: users[3]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4',
        videoPath: '/uploads/videos/demo-video-5.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video5/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-5.jpg',
        duration: 2640,
        fileSize: 182000000,
        visibility: 'public',
        isProcessing: false,
        views: 298,
        likes: 67,
        transcript: 'Linear regression is a supervised learning algorithm. We try to fit a line through our data points. The hypothesis function is h(x) = θ₀ + θ₁x...',
        summary: 'Beginner-friendly introduction to ML covering regression concepts, cost functions, and gradient descent optimization.'
      },
      {
        title: 'Web Development - React Hooks Tutorial',
        description: 'Modern React development using hooks: useState, useEffect, useContext, and custom hooks.',
        subject: 'Programming',
        topic: 'Web Development',
        uploader: users[1]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_6mb.mp4',
        videoPath: '/uploads/videos/demo-video-6.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video6/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-6.jpg',
        duration: 2880,
        fileSize: 195000000,
        visibility: 'public',
        isProcessing: false,
        views: 312,
        likes: 72,
        transcript: 'React Hooks allow us to use state and lifecycle features in functional components. useState lets us add state to functional components...',
        summary: 'Complete guide to React Hooks with examples showing how to manage state, side effects, and create reusable custom hooks.'
      },
      {
        title: 'Algorithm Design - Dynamic Programming Fundamentals',
        description: 'Master dynamic programming with examples: Fibonacci, Knapsack, Longest Common Subsequence.',
        subject: 'Programming',
        topic: 'Algorithms',
        uploader: users[0]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_7mb.mp4',
        videoPath: '/uploads/videos/demo-video-7.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video7/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-7.jpg',
        duration: 3120,
        fileSize: 215000000,
        visibility: 'public',
        isProcessing: false,
        views: 187,
        likes: 43,
        transcript: 'Dynamic programming is an optimization technique. We break problems into overlapping subproblems and store results to avoid recomputation...',
        summary: 'Learn DP concepts including memoization, tabulation, and how to identify and solve DP problems efficiently.'
      },
      {
        title: 'Operating Systems - Process Synchronization',
        description: 'Understand critical sections, semaphores, mutexes, and classic synchronization problems.',
        subject: 'Programming',
        topic: 'Operating Systems',
        uploader: users[2]._id,
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_8mb.mp4',
        videoPath: '/uploads/videos/demo-video-8.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/video8/640/360',
        thumbnailPath: '/uploads/thumbnails/demo-thumb-8.jpg',
        duration: 2520,
        fileSize: 175000000,
        visibility: 'public',
        isProcessing: false,
        views: 145,
        likes: 34,
        transcript: 'Process synchronization ensures that multiple processes can execute without interfering with each other. Critical section is the part of code that accesses shared resources...',
        summary: 'Covers race conditions, synchronization mechanisms, and solutions to classic problems like Producer-Consumer and Readers-Writers.'
      }
    ]);
    console.log('✅ Created 8 demo videos');

    // Create demo comments
    const comments = await Comment.create([
      {
        video: videos[0]._id,
        author: users[1]._id,
        text: 'Excellent explanation! The visualization of pointer movements in linked lists really helped me understand.',
        likes: 12
      },
      {
        video: videos[0]._id,
        author: users[2]._id,
        text: 'Could you please make a follow-up video on circular linked lists and doubly linked lists?',
        likes: 8
      },
      {
        video: videos[1]._id,
        author: users[3]._id,
        text: 'The polymorphism examples were very clear. Thank you for showing both method overloading and overriding!',
        likes: 15
      },
      {
        video: videos[4]._id,
        author: users[0]._id,
        text: 'Great work! This is exactly what our ML course needed. The gradient descent visualization was perfect.',
        likes: 23
      }
    ]);
    console.log('✅ Created demo comments');

    // Create demo Q&A
    const qaThreads = await QA.create([
      {
        video: videos[0]._id,
        askedBy: users[2]._id,
        question: 'What is the time complexity of inserting an element at the beginning of a linked list vs an array?',
        answers: [
          {
            answeredBy: users[0]._id,
            text: 'Great question! For a linked list, insertion at the beginning is O(1) because we just need to update the head pointer. For an array, it\'s O(n) because we need to shift all existing elements to make room.',
            isAccepted: true,
            likes: 18
          }
        ],
        likes: 9
      },
      {
        video: videos[1]._id,
        askedBy: users[2]._id,
        question: 'Can you explain the difference between abstract classes and interfaces in Java?',
        answers: [
          {
            answeredBy: users[1]._id,
            text: 'Abstract classes can have both abstract and concrete methods, while interfaces (before Java 8) could only have abstract methods. A class can implement multiple interfaces but extend only one abstract class.',
            isAccepted: true,
            likes: 14
          },
          {
            answeredBy: users[0]._id,
            text: 'Also, abstract classes can have constructors and instance variables, while interfaces cannot have instance variables (only constants).',
            isAccepted: false,
            likes: 10
          }
        ],
        likes: 7
      },
      {
        video: videos[4]._id,
        askedBy: users[1]._id,
        question: 'How do we choose the learning rate for gradient descent?',
        answers: [
          {
            answeredBy: users[3]._id,
            text: 'The learning rate is typically chosen through experimentation. Start with common values like 0.01, 0.001, or 0.0001. Too large and the algorithm won\'t converge; too small and training will be very slow.',
            isAccepted: true,
            likes: 21
          }
        ],
        likes: 11
      }
    ]);
    console.log('✅ Created demo Q&A threads');

    // Create demo playlists
    const playlists = await Playlist.create([
      {
        title: 'Complete Data Structures Course',
        description: 'All topics from KLH syllabus - Arrays, Linked Lists, Stacks, Queues, Trees, Graphs',
        subject: 'Programming',
        topic: 'Data Structures',
        creator: users[0]._id,
        videos: [videos[0]._id, videos[6]._id],
        visibility: 'public'
      },
      {
        title: 'Web Development Fundamentals',
        description: 'Learn full-stack web development aligned with course curriculum',
        subject: 'Programming',
        topic: 'Web Development',
        creator: users[1]._id,
        videos: [videos[5]._id],
        visibility: 'public'
      },
      {
        title: 'Database Systems Complete Guide',
        description: 'From basic SQL to advanced database concepts and normalization',
        subject: 'Programming',
        topic: 'Database Management',
        creator: users[0]._id,
        videos: [videos[2]._id],
        visibility: 'public'
      },
      {
        title: 'Computer Networks Masterclass',
        description: 'OSI Model, TCP/IP, Network Security, and Protocols',
        subject: 'Programming',
        topic: 'Computer Networks',
        creator: users[2]._id,
        videos: [videos[3]._id],
        visibility: 'public'
      },
      {
        title: 'Machine Learning Bootcamp',
        description: 'From basics to advanced ML algorithms with practical implementations',
        subject: 'Mathematics',
        topic: 'Machine Learning',
        creator: users[3]._id,
        videos: [videos[4]._id],
        visibility: 'public'
      }
    ]);
    console.log('✅ Created demo playlists');

    console.log('\n🎉 Demo data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log(`   - Q&A Threads: ${qaThreads.length}`);
    console.log(`   - Playlists: ${playlists.length}`);
    console.log('\n✨ You can now login with any of these accounts:');
    console.log('   Email: rajesh.kumar@klh.edu.in | Password: password123');
    console.log('   Email: priya.sharma@klh.edu.in | Password: password123');
    console.log('   Email: arjun.patel@klh.edu.in | Password: password123');
    console.log('   Email: sneha.reddy@klh.edu.in | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

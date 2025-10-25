# 🚀 Quick Start Guide

## Step 1: Setup MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (free tier is fine)
4. Create a database user:
   - Username: `klhuser`
   - Password: (create a strong password)
5. Add IP address: `0.0.0.0/0` (for development)
6. Get your connection string from "Connect" → "Connect your application"

## Step 2: Configure Environment

### Backend Configuration
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://klhuser:YOUR_PASSWORD@cluster.mongodb.net/klh-peer-learning?retryWrites=true&w=majority
JWT_SECRET=create_a_very_long_random_string_here_at_least_32_characters
```

### Frontend Configuration  
The default `frontend/.env` should work:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Step 3: Install Dependencies

Run the setup script:
```bash
./setup.sh
```

Or manually:
```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

## Step 4: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## Step 5: Test the Application

1. Open http://localhost:3000
2. Click "Register" to create an account
3. Use format `KLHXXX` for University ID (e.g., KLH001)
4. After registration, you'll be logged in automatically
5. Try uploading a video from the Upload page

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string is correct
- Ensure password doesn't contain special characters that need URL encoding

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Default Test Credentials

Since the database is fresh, you'll need to register a new account.

## 🎯 Key Features to Test

1. ✅ User Registration & Login
2. ✅ Video Upload (use small video files for testing)
3. ✅ Video Playback
4. ✅ Comments on Videos
5. ✅ Q&A Section
6. ✅ User Profile
7. ✅ Search & Filter Videos

## 📚 Additional Resources

- [Full README](README.md)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

## 🆘 Need Help?

Check the console logs in both terminal windows for detailed error messages.

### Backend Logs
Look for:
- ✅ MongoDB Connected
- 🚀 Server running on port 5000

### Frontend Logs
Look for:
- Compiled successfully!
- Running on http://localhost:3000

---

Happy Learning! 🎓

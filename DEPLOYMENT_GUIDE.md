# 🚀 KLH Peer Learning Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Completed Features
- [x] User Authentication (JWT-based)
- [x] Video Upload & Streaming
- [x] Interactive Comments System
- [x] Q&A Forums
- [x] Playlist Management
- [x] AI Chatbot (Gemini API)
- [x] Video Transcript Generation
- [x] Video Summarization
- [x] Search & Filtering
- [x] User Profiles
- [x] CORS Configuration
- [x] Environment Variables Setup

### 🔧 Technical Stack
- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: React 19 + Tailwind CSS + TanStack Query
- **AI Integration**: Google Gemini API
- **Authentication**: JWT Tokens
- **File Storage**: Local uploads (Render static files)
- **Database**: MongoDB Atlas

## 🌐 Render.com Deployment Steps

### Step 1: Prepare Repository
1. Ensure all code is committed to GitHub
2. Verify `render.yaml` configuration
3. Test locally with production environment variables

### Step 2: Deploy Backend
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `klh-peer-learning-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables (Backend)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://klhuser:KlhPeerLearning123!@perplexedui.j7czeem.mongodb.net/klh-peer-learning?retryWrites=true&w=majority
JWT_SECRET=klh_jwt_secret_2024_make_this_long_and_random_123
JWT_EXPIRES_IN=90d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://klh-peer-learning-frontend.onrender.com
```

### Step 4: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `klh-peer-learning-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

### Step 5: Set Environment Variables (Frontend)
```
REACT_APP_API_URL=https://klh-peer-learning-backend.onrender.com
```

### Step 6: Update CORS (After Backend URL is Known)
1. Get your backend URL from Render dashboard
2. Update `FRONTEND_URL` in backend environment variables
3. Redeploy backend if needed

## 🔑 API Keys Setup

### Gemini API (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Update `GEMINI_API_KEY` in backend environment variables
4. Redeploy backend

**Note**: Without Gemini API key, chatbot will use fallback responses and video summaries will be generated from templates.

## 📊 Database Setup

### MongoDB Atlas Configuration
- **Database**: `klh-peer-learning`
- **Connection String**: Already configured in environment variables
- **Collections**: Users, Videos, Playlists, Comments, QA

### Sample Data
The platform includes demo data for testing:
- 4 demo users (faculty + students)
- 8 educational videos with transcripts
- 5 curated playlists
- Sample comments and Q&A

## 🧪 Testing After Deployment

### Backend Health Check
```bash
curl https://klh-peer-learning-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "KLH Peer Learning Backend is running!",
  "database": "Connected",
  "timestamp": "2024-01-XX..."
}
```

### Frontend Access
- URL: `https://klh-peer-learning-frontend.onrender.com`
- Should redirect to login page
- Test with demo credentials

### Demo Login Credentials
```
Faculty: rajesh.kumar@klh.edu.in / password123
Student: priya.sharma@klh.edu.in / password123
Student: arjun.patel@klh.edu.in / password123
Student: sneha.reddy@klh.edu.in / password123
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` in backend environment variables
   - Ensure URLs match exactly (including https://)

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist (should include 0.0.0.0/0)

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json
   - Check build logs in Render dashboard

4. **File Upload Issues**
   - Render free tier has file size limits
   - Consider using cloud storage for production

### Performance Optimization

1. **Video Streaming**
   - Consider using CDN for video files
   - Implement video compression
   - Add video thumbnails

2. **Database**
   - Add indexes for frequently queried fields
   - Implement pagination for large datasets

3. **Caching**
   - Add Redis for session storage
   - Implement API response caching

## 📈 Monitoring

### Render Dashboard
- Monitor service health
- Check build logs
- Monitor resource usage

### Application Logs
- Backend logs available in Render dashboard
- Check for errors in browser console
- Monitor API response times

## 🚀 Post-Deployment Tasks

1. **Test All Features**
   - User registration/login
   - Video upload/playback
   - Comments and Q&A
   - Playlist creation
   - Chatbot functionality
   - Search and filtering

2. **Performance Testing**
   - Load testing with multiple users
   - Video streaming performance
   - Database query optimization

3. **Security Review**
   - Verify JWT token security
   - Check file upload restrictions
   - Review API rate limiting

4. **Documentation**
   - Update README with live URLs
   - Document API endpoints
   - Create user guide

## 📞 Support

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com)

### Application Support
- Check logs in Render dashboard
- Monitor MongoDB Atlas for database issues
- Review browser console for frontend errors

---

## 🎉 Deployment Complete!

Your KLH Peer Learning Platform is now live and ready for students and faculty to use!

**Live URLs:**
- Frontend: `https://klh-peer-learning-frontend.onrender.com`
- Backend: `https://klh-peer-learning-backend.onrender.com`
- API Health: `https://klh-peer-learning-backend.onrender.com/api/health`

**Next Steps:**
1. Share the platform with KLH University community
2. Gather user feedback
3. Implement additional features based on usage
4. Scale infrastructure as needed

Happy Learning! 🎓

# 🚀 DEPLOY NOW - Quick Start

## ⚡ 3-STEP DEPLOYMENT (10 minutes)

Your app is ready to deploy! Follow these exact steps:

---

## STEP 1: PUSH TO GITHUB (2 minutes)

### A. Create `.gitignore` file

Create this file in the root folder:

**File**: `/Users/macbookair/Downloads/klh-peer-learningg/.gitignore`

```
node_modules/
.env
.env.local
build/
dist/
*.log
.DS_Store
backend/uploads/videos/*
!backend/uploads/videos/.gitkeep
```

### B. Initialize Git

```bash
cd /Users/macbookair/Downloads/klh-peer-learningg

git init
git add .
git commit -m "KLH Peer Learning Platform"
```

### C. Create GitHub Repository

1. Go to: https://github.com/new
2. Name: `klh-peer-learning`
3. Click "Create repository"
4. Copy the commands shown (will look like this):

```bash
git remote add origin https://github.com/YOUR-USERNAME/klh-peer-learning.git
git branch -M main
git push -u origin main
```

✅ **Code on GitHub!**

---

## STEP 2: DEPLOY BACKEND (4 minutes)

### A. Go to Render

1. Visit: https://dashboard.render.com
2. Sign up (free) if you don't have account
3. Click "New +" → "Web Service"
4. Click "Connect GitHub" → Select your repo
5. Click "Connect"

### B. Configure Backend

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `klh-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### C. Add Environment Variables

Click "Add Environment Variable" and add these:

**Get MongoDB URI from your `.env` file!**

| Key | Value |
|-----|-------|
| `MONGODB_URI` | (copy from your .env file) |
| `JWT_SECRET` | `klh-secret-2025-change-this` |
| `PORT` | `5001` |
| `NODE_ENV` | `production` |

### D. Deploy

1. Click "Create Web Service"
2. Wait 3-5 minutes
3. **SAVE YOUR BACKEND URL**: e.g., `https://klh-backend.onrender.com`

### E. Test

Visit: `https://YOUR-BACKEND-URL/api/health`

Should see: `{"status":"OK","database":"Connected"}`

✅ **Backend Live!**

---

## STEP 3: DEPLOY FRONTEND (4 minutes)

### A. Create Static Site

1. Render Dashboard → "New +" → "Static Site"
2. Select same GitHub repo
3. Click "Connect"

### B. Configure Frontend

| Setting | Value |
|---------|-------|
| **Name** | `klh-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

### C. Add Environment Variable

Click "Advanced" → "Add Environment Variable":

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | YOUR BACKEND URL (e.g., `https://klh-backend.onrender.com`) |

**IMPORTANT**: No trailing slash!

### D. Deploy

1. Click "Create Static Site"
2. Wait 3-5 minutes
3. **SAVE YOUR FRONTEND URL**: e.g., `https://klh-frontend.onrender.com`

### E. Update Backend CORS

1. Go back to **Backend service** in Render
2. Click "Environment" tab
3. **Add new environment variable**:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | YOUR FRONTEND URL |

4. Save (backend will auto-redeploy)

✅ **Frontend Live!**

---

## 🎊 YOU'RE DEPLOYED!

### Your Live URLs:

**App**: https://klh-frontend.onrender.com  
**API**: https://klh-backend.onrender.com

### Test It:

1. Open your frontend URL
2. Register with `yourname@klh.edu.in`
3. Browse videos
4. Test chatbot
5. Upload a video
6. Everything works!

---

## 🎯 DEMO DATA (OPTIONAL)

Want demo videos and users?

### Option 1: Render Shell

1. Go to backend service on Render
2. Click "Shell" tab
3. Run: `node seed-demo.js`
4. Done!

### Option 2: Local to Production DB

```bash
cd backend
node seed-demo.js
```

(Uses your MongoDB Atlas - same database as production)

---

## ⚠️ IMPORTANT NOTES

### First Load is Slow

- Free tier "sleeps" after 15 min
- First request takes ~30 seconds to wake up
- After that, it's fast!

### File Upload Limit

- Render free tier: 512MB storage
- For large videos, use Cloudinary or S3
- Small demo videos work fine

### MongoDB Atlas

Make sure MongoDB allows connections:
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (allow all)
4. Save

---

## 🐛 TROUBLESHOOTING

### "Application Error" on Frontend

**Fix**:
- Check `REACT_APP_API_URL` is set correctly
- Make sure it's your backend URL with `https://`
- No trailing slash

### CORS Error

**Fix**:
- Backend environment needs `FRONTEND_URL`
- Should match your frontend URL exactly
- Both use `https://`

### Can't Login

**Fix**:
- Check MongoDB Atlas connection
- Make sure IP whitelist allows `0.0.0.0/0`
- Check backend logs in Render

---

## 📱 SHARE YOUR APP

### For Hackathon Judges

Send them:
```
🌐 Live App: https://YOUR-FRONTEND.onrender.com
📦 GitHub: https://github.com/YOUR-USERNAME/klh-peer-learning
📚 Docs: Check README.md
```

### Demo Account

If you seeded data:
```
Email: priya.sharma@klh.edu.in
Password: password123
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables set
- [ ] MongoDB Atlas accessible
- [ ] CORS configured (FRONTEND_URL)
- [ ] Tested live app
- [ ] Demo data seeded (optional)
- [ ] Shared URLs with team

---

## 🎓 WHAT TO SAY IN PRESENTATION

"We built a full-stack peer learning platform for KLH University. It's deployed on Render with MongoDB Atlas, features AI-powered chatbot, video streaming, transcripts, and summaries. All core and bonus requirements implemented. Here's the live demo..."

**Then show your deployed URL!** 🚀

---

## 💡 TIPS

1. **Keep Render Dashboard Open**: Monitor logs during demo
2. **Have Backup**: Keep localhost running just in case
3. **Test Before Demo**: Make sure it works 30 min before
4. **Clear Explanation**: Explain features clearly
5. **Show Code**: Have GitHub open to show your work

---

## 🏆 YOU'VE GOT THIS!

Your platform is production-ready, feature-complete, and ready to impress!

**Go deploy and win that hackathon!** 🎉

---

**Need detailed help?** Check `RENDER_DEPLOYMENT_STEP_BY_STEP.md`

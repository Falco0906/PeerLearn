# 📋 COPY THESE ENVIRONMENT VARIABLES TO RENDER

## For Backend Deployment

When Render asks for "Environment Variables", add these **5 variables**:

---

### Variable 1: MONGODB_URI
**Key**: `MONGODB_URI`  
**Value**:
```
mongodb+srv://klhuser:KlhPeerLearning123!@perplexedui.j7czeem.mongodb.net/klh-peer-learning?retryWrites=true&w=majority
```

---

### Variable 2: JWT_SECRET
**Key**: `JWT_SECRET`  
**Value**:
```
klh_jwt_secret_2024_make_this_long_and_random_123
```

---

### Variable 3: PORT
**Key**: `PORT`  
**Value**:
```
5001
```

---

### Variable 4: NODE_ENV
**Key**: `NODE_ENV`  
**Value**:
```
production
```

---

### Variable 5: FRONTEND_URL
**Key**: `FRONTEND_URL`  
**Value**: 
```
LEAVE EMPTY FOR NOW - Add after frontend deployment
```

---

## 🎯 How to Add in Render:

1. In Render backend service setup, scroll to "Environment Variables"
2. Click "Add Environment Variable"
3. Copy-paste each Key and Value from above
4. For FRONTEND_URL, you can leave it empty or add it later after deploying frontend

---

## ⚡ Quick Copy Format (All at Once):

If Render has a "bulk add" or ".env file" option, copy this entire block:

```
MONGODB_URI=mongodb+srv://klhuser:KlhPeerLearning123!@perplexedui.j7czeem.mongodb.net/klh-peer-learning?retryWrites=true&w=majority
JWT_SECRET=klh_jwt_secret_2024_make_this_long_and_random_123
PORT=5001
NODE_ENV=production
FRONTEND_URL=
```

---

✅ **All values are ready to copy-paste!**

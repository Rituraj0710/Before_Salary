# Frontend-Backend Connection Setup

## ✅ Backend Configuration (DONE)

Your backend (`Server/server.js`) is now configured to accept requests from:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (React dev)
- `https://before-salary-frontend.onrender.com` (Your Render frontend)
- `https://beforesalary.vercel.app` (Your Vercel frontend if deployed)
- Any origin with `localhost` in development

## 📝 Frontend Configuration (YOU NEED TO DO THIS)

### Step 1: Create `.env` file in `Client/` directory

Since `.env` files are gitignored, you need to create it manually:

**File: `Client/.env`**
```env
VITE_API_URL=https://before-salary-1.onrender.com/api
```

### Step 2: For Local Development

When testing locally, use:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: How It Works

Your `Client/src/utils/api.js` already uses this:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

So it will automatically:
- Use `VITE_API_URL` from `.env` if available
- Fall back to `http://localhost:5000/api` if not set

## 🚀 Deployment Steps

### For Vercel (Frontend):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://before-salary-1.onrender.com/api`
   - **Environment**: Production (and Preview if needed)
3. Redeploy your frontend

### For Render (Frontend - if using Render):

1. Go to Render Dashboard → Your Frontend Service → Environment
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://before-salary-1.onrender.com/api`
3. Trigger a new deploy

### For Render (Backend - Optional):

Add environment variable for frontend URL:
- **Key**: `FRONTEND_URL`
- **Value**: `https://beforesalary.vercel.app` (or your actual frontend URL)

## 🧪 Testing the Connection

### 1. Test Backend Health
Open browser and visit:
```
https://before-salary-1.onrender.com/health
```
Should return: `{"status":"OK"}`

### 2. Test API Endpoint
```
https://before-salary-1.onrender.com/api/loans
```
Should return loan data or authentication error (both are OK - means API is working)

### 3. Test from Frontend
Open browser console on your frontend and run:
```javascript
fetch('https://before-salary-1.onrender.com/api/loans')
  .then(res => res.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Connection failed:', err));
```

## 🔧 Troubleshooting

### CORS Error
If you see "CORS policy: No 'Access-Control-Allow-Origin'" error:
1. Check backend logs on Render
2. Verify your frontend URL is in the `allowedOrigins` list
3. Make sure backend is deployed with the latest changes

### 401 Unauthorized
This is normal for protected routes. Try:
```javascript
// Test public endpoint
fetch('https://before-salary-1.onrender.com/api/loans')
```

### Connection Refused
1. Check if backend is running on Render
2. Verify the URL is correct: `https://before-salary-1.onrender.com`
3. Check Render logs for errors

## 📋 Current Setup Summary

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | `https://before-salary-1.onrender.com/api` | ✅ Configured |
| Frontend (Render) | `https://before-salary-frontend.onrender.com` | ⚙️ Need to add env var |
| Frontend (Local) | `http://localhost:5173` | ⚙️ Need to create .env |
| CORS | Multiple origins allowed | ✅ Configured |
| SMTP | Hostinger configured | ✅ Configured |

## ✨ Next Steps

1. **Create `Client/.env` file** with backend URL
2. **Add environment variable on Vercel/Render** for production
3. **Test the connection** using browser console
4. **Deploy frontend** with new environment variable
5. **Test full flow** (login, register, etc.)

---

**Your backend is ready! Just add the frontend environment variable and you're good to go! 🎉**


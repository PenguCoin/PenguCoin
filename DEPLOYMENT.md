# Vercel Deployment Guide

## Important: Separate Backend Deployment Required

This project has **two separate parts** that need to be deployed independently:

### 1. Frontend (Next.js) - Deploy to Vercel
The frontend can be deployed directly to Vercel.

### 2. Backend (Express API) - Deploy Separately
The backend server (`/server` folder) **cannot run on Vercel** and needs to be deployed to a different platform.

## Recommended Backend Hosting Options

### Option 1: Railway (Recommended - Easiest)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Set Root Directory to `/` (it will detect the server)
5. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - 5000 (or Railway will set this automatically)
   - `CLIENT_URL` - Your Vercel frontend URL
6. Deploy and get your backend URL

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm run start:server`
5. Add environment variables (same as above)
6. Deploy and get your backend URL

### Option 3: Heroku
1. Install Heroku CLI
2. Create a new app
3. Set buildpack and environment variables
4. Deploy using Git

## Frontend Deployment to Vercel

### Step 1: Set Environment Variable in Vercel
In your Vercel project settings, add:
- `NEXT_PUBLIC_API_URL` - Your deployed backend URL + `/api` (e.g., `https://your-backend.railway.app/api`)

### Step 2: Deploy
Push to your GitHub repository and Vercel will automatically deploy.

## Important Notes

1. **The frontend ONLY works with a deployed backend** - localhost won't work in production
2. Make sure MongoDB is accessible from your backend hosting (use MongoDB Atlas for cloud database)
3. Update CORS settings in `server/index.ts` to allow your Vercel frontend URL
4. The backend needs to be running 24/7 for the frontend to work

## MongoDB Atlas Setup (Required)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Whitelist all IPs (0.0.0.0/0) for your backend hosting
5. Use this connection string in your backend environment variables

## Quick Checklist

- [ ] Backend deployed to Railway/Render/Heroku
- [ ] MongoDB Atlas set up and connection string added
- [ ] Backend environment variables configured
- [ ] Frontend environment variable `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] CORS configured in backend to allow frontend URL
- [ ] Test all features after deployment

# FutStocks - Installation & Launch Checklist

Follow this checklist to get FutStocks running successfully.

## ✅ Pre-Installation Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB installed locally OR MongoDB Atlas account ready
- [ ] Terminal/command prompt ready
- [ ] Code editor (VS Code, etc.) optional but recommended

## ✅ Installation Steps

### 1. Dependencies
- [ ] Run `npm install`
- [ ] Wait for all packages to install (may take 2-3 minutes)
- [ ] Check for any error messages

### 2. Environment Setup
- [ ] Verify `.env` file exists in root directory
- [ ] Verify `.env.local` file exists in root directory
- [ ] Check `.env` contains:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT`
  - `CLIENT_URL`
- [ ] Check `.env.local` contains:
  - `NEXT_PUBLIC_API_URL`

### 3. Database Setup
**If using local MongoDB:**
- [ ] Start MongoDB service (`mongod`)
- [ ] Verify MongoDB is running on port 27017
- [ ] Database `futstocks` will be created automatically

**If using MongoDB Atlas:**
- [ ] Create cluster on MongoDB Atlas
- [ ] Get connection string
- [ ] Update `MONGODB_URI` in `.env`
- [ ] Whitelist your IP address
- [ ] Create database user with read/write permissions

### 4. Seed Database (Recommended)
- [ ] Run `npm run seed`
- [ ] Verify success message: "✅ Seeded XX players successfully!"
- [ ] Confirm 30+ players added to database

## ✅ Launch Checklist

### 1. Start Application
- [ ] Run `npm run dev`
- [ ] Check both servers start:
  - [ ] "✅ MongoDB connected successfully"
  - [ ] "🚀 Server running on port 5000"
  - [ ] "ready - started server on 0.0.0.0:3000"
- [ ] No error messages in console

### 2. Verify Frontend
- [ ] Open browser to http://localhost:3000
- [ ] Landing page loads with "FutStocks" branding
- [ ] Navigation bar appears
- [ ] "Get Started" and "Sign In" buttons visible
- [ ] No console errors in browser DevTools

### 3. Verify Backend
- [ ] Open http://localhost:5000/api/health in browser
- [ ] Should see: `{"status":"ok","message":"FutStocks API is running"}`
- [ ] OR use curl: `curl http://localhost:5000/api/health`

## ✅ First User Setup

### 1. Create Account
- [ ] Click "Sign Up" or go to http://localhost:3000/register
- [ ] Enter username (3-30 characters)
- [ ] Enter valid email address
- [ ] Enter password (6+ characters)
- [ ] Confirm password matches
- [ ] Click "Create Account"
- [ ] Redirects to market page
- [ ] Navigation shows username and balance ($10,000)

### 2. Test Market
- [ ] Market page shows list of players
- [ ] Can filter by position (GK, DEF, MID, FWD)
- [ ] Can search for players
- [ ] Can sort by different criteria
- [ ] Click on a player card
- [ ] Buy modal opens
- [ ] Can select quantity
- [ ] Shows total cost
- [ ] "Confirm Purchase" button works

### 3. Test Portfolio
- [ ] Navigate to "Portfolio" page
- [ ] Shows purchased player(s)
- [ ] Shows current value and ROI
- [ ] Balance updated correctly
- [ ] Can click "Sell" button
- [ ] Sell modal works

### 4. Test Leaderboard
- [ ] Navigate to "Leaderboard" page
- [ ] Shows your username in rankings
- [ ] Shows wealth, portfolio value, and ROI
- [ ] Ranking is correct

## ✅ Admin Setup (Optional)

### 1. Make User Admin
**Using MongoDB Shell (mongosh):**
```bash
mongosh futstocks
db.users.updateOne(
  { email: "YOUR_EMAIL" },
  { $set: { isAdmin: true } }
)
exit
```

**Using MongoDB Compass:**
- [ ] Connect to MongoDB
- [ ] Open `futstocks` database
- [ ] Open `users` collection
- [ ] Find your user document
- [ ] Edit document
- [ ] Set `isAdmin: true`
- [ ] Save changes

### 2. Verify Admin Access
- [ ] Refresh browser page
- [ ] "Admin" link appears in navigation
- [ ] Click "Admin" link
- [ ] Admin panel loads at http://localhost:3000/admin
- [ ] Three tabs visible: Create Player, Update Stats, Manage Matchweek

### 3. Test Admin Functions
**Create Player:**
- [ ] Fill in player name
- [ ] Select team
- [ ] Choose position
- [ ] Set price
- [ ] Click "Create Player"
- [ ] Success toast appears
- [ ] Player appears in market

**Create Matchweek:**
- [ ] Go to "Manage Matchweek" tab
- [ ] Enter week number (1)
- [ ] Set start date (today)
- [ ] Set end date (7 days later)
- [ ] Click "Create Matchweek"
- [ ] Success toast appears

**Update Stats:**
- [ ] Go to "Update Stats" tab
- [ ] Select a player from dropdown
- [ ] Enter matchweek number (1)
- [ ] Enter stats (goals, assists, rating, etc.)
- [ ] Click "Update Stats & Prices"
- [ ] Success toast appears
- [ ] Player price updates in market

## ✅ Troubleshooting Checklist

### MongoDB Issues
- [ ] MongoDB service is running (`ps aux | grep mongod`)
- [ ] Port 27017 is not in use by another process
- [ ] Connection string is correct in `.env`
- [ ] For Atlas: IP is whitelisted, credentials are correct

### Port Conflicts
- [ ] Port 3000 is not in use (`lsof -i :3000` or `netstat -ano | findstr :3000`)
- [ ] Port 5000 is not in use (`lsof -i :5000` or `netstat -ano | findstr :5000`)
- [ ] If ports in use, change in configuration files

### Authentication Issues
- [ ] Clear browser cookies (Application → Cookies → localhost)
- [ ] Clear localStorage (Application → Local Storage → localhost)
- [ ] Check JWT_SECRET is set in `.env`
- [ ] Try logout and login again

### API Connection Issues
- [ ] Backend server is running (check terminal)
- [ ] Frontend can reach backend (check browser DevTools Network tab)
- [ ] CORS is configured correctly (CLIENT_URL in `.env`)
- [ ] API_URL in `.env.local` matches backend URL

### Build Issues
- [ ] Delete `node_modules` and run `npm install` again
- [ ] Delete `.next` folder and restart dev server
- [ ] Check Node.js version is 18+
- [ ] Check npm version is recent

## ✅ Success Criteria

Your installation is successful when:
- [ ] ✅ Both frontend and backend run without errors
- [ ] ✅ Can register and login successfully
- [ ] ✅ Can see players in market
- [ ] ✅ Can buy and sell players
- [ ] ✅ Portfolio updates correctly
- [ ] ✅ Leaderboard shows rankings
- [ ] ✅ (Admin) Can create players and update stats
- [ ] ✅ Toast notifications work
- [ ] ✅ Navigation works across all pages
- [ ] ✅ Mobile view is responsive

## 📚 Next Steps After Installation

1. **Read Documentation:**
   - [ ] Review QUICKSTART.md for usage guide
   - [ ] Check README_FUTSTOCKS.md for full features
   - [ ] See PROJECT_SUMMARY.md for architecture

2. **Explore Features:**
   - [ ] Try different player positions
   - [ ] Test buy/sell with multiple players
   - [ ] Check transaction history
   - [ ] Monitor portfolio ROI changes
   - [ ] Compare with other users on leaderboard

3. **Admin Workflow:**
   - [ ] Add realistic players from your favorite teams
   - [ ] Set up weekly matchweeks
   - [ ] Update stats after real matches
   - [ ] Watch the economy adjust dynamically

4. **Customize:**
   - [ ] Adjust starting balance in User model
   - [ ] Modify ROI calculation in roiCalculator.ts
   - [ ] Customize colors in Tailwind classes
   - [ ] Add more player fields (nationality, age, etc.)

## 🎉 Ready to Launch!

If all checkboxes are marked, congratulations! FutStocks is ready to use.

**Quick Commands:**
```bash
# Start everything
npm run dev

# Stop servers
Ctrl + C (in terminal)

# Reset database
Drop 'futstocks' database in MongoDB and run npm run seed

# View logs
Check terminal output for backend logs
Check browser DevTools console for frontend logs
```

---

**Need help?** Check the troubleshooting section or review the README files!

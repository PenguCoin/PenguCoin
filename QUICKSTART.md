# FutStocks - Quick Start Guide

Get FutStocks up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally (or MongoDB Atlas account)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
The `.env` and `.env.local` files are already created with default values:
- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB: `mongodb://localhost:27017/futstocks`

### 3. Start MongoDB
If running locally:
```bash
# In a separate terminal
mongod
```

Or use MongoDB Atlas and update the `MONGODB_URI` in `.env`

### 4. Seed the Database (Optional but Recommended)
Add 30+ sample football players:
```bash
npm run seed
```

### 5. Start the Application
```bash
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Time Usage

### 1. Create Your Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Register with username, email, and password
4. You'll start with $10,000!

### 2. Make Yourself Admin (Optional)
To access the admin panel, update your user in MongoDB:

**Using MongoDB Shell:**
```bash
mongosh futstocks
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)
```

**Using MongoDB Compass:**
1. Connect to `mongodb://localhost:27017`
2. Open `futstocks` database → `users` collection
3. Find your user and edit it
4. Set `isAdmin: true`

### 3. Add Players (if not seeded)
If you didn't run the seed script:
1. Log in as admin
2. Go to http://localhost:3000/admin
3. Use "Create Player" tab to add players

Example:
- Name: Erling Haaland
- Team: Manchester City
- Position: Forward
- Price: 5000

### 4. Start Trading!
1. Go to Market page
2. Browse players
3. Click "Buy Player"
4. Select quantity and confirm
5. View your investments in Portfolio
6. Sell when prices go up!

## Admin Workflow

### Managing a Matchweek

1. **Create Matchweek** (Admin Panel → Manage Matchweek)
   - Week Number: 1
   - Start Date: Today
   - End Date: 7 days from now

2. **After Real Matches, Update Player Stats** (Admin Panel → Update Stats)
   - Select Player
   - Enter Matchweek: 1
   - Input: Goals, Assists, Minutes, Rating, etc.
   - Click "Update Stats & Prices"
   - System automatically calculates ROI and updates price!

3. **Watch Prices Change**
   - Good performance = Price increases
   - Bad performance = Price decreases
   - Users earn/lose money based on their investments

## Example Player Stats Update

**Erling Haaland had a great game:**
- Goals: 2
- Assists: 1
- Minutes: 90
- Rating: 9.5
- Clean Sheet: No
- Cards: 0

Result: High ROI → Price increases → Investors earn money!

## Common Commands

```bash
# Development (both servers)
npm run dev

# Frontend only
npm run dev:client

# Backend only
npm run dev:server

# Seed database with sample players
npm run seed

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running: `mongod`
- Check `.env` has correct `MONGODB_URI`

**Port Already in Use:**
- Frontend: Change port in `package.json` dev:client script
- Backend: Change `PORT` in `.env`

**Can't Login:**
- Clear browser cookies and localStorage
- Check MongoDB has your user

**Admin Panel Not Accessible:**
- Make sure your user has `isAdmin: true` in database

## Next Steps

1. ✅ Register and get $10,000
2. ✅ Browse the market
3. ✅ Buy your first player
4. ✅ Check the leaderboard
5. ✅ (Admin) Create matchweeks and update stats
6. ✅ Watch your wealth grow!

## Need Help?

Check the full README_FUTSTOCKS.md for:
- Complete API documentation
- Detailed feature explanations
- Architecture overview
- Advanced configuration

---

**Ready to become a FutStocks champion?** 🏆⚽💰

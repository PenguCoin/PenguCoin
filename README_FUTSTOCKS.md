# FutStocks - Football Player Investment Platform

A complete web application where users can invest in football players like stocks and earn ROI based on their real-world match performance each week.

## Features

### User Features
- **User Authentication**: Secure JWT-based authentication with registration and login
- **Starting Balance**: Each new user starts with $10,000 in virtual currency
- **Player Market**: Browse, search, and filter football players by position, price, and performance
- **Buy/Sell System**: Purchase and sell player shares with real-time pricing
- **Portfolio Management**: Track your investments with live ROI calculations
- **Transaction History**: View all your past buy/sell transactions
- **Leaderboard**: Compete with other users ranked by total wealth
- **Real-time Updates**: Player prices update based on match performance

### Admin Features
- **Player Management**: Create and manage football players
- **Stats Updates**: Update player performance stats (goals, assists, ratings, etc.)
- **Matchweek System**: Create and manage matchweeks
- **Automatic ROI Calculation**: System automatically calculates ROI based on performance
- **Dynamic Pricing**: Player prices adjust based on performance and popularity

### Technical Features
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Toast Notifications**: User-friendly feedback for all actions
- **Smooth Animations**: Professional transitions and effects
- **MongoDB Database**: Scalable NoSQL database for all data
- **RESTful API**: Clean API architecture with Express.js
- **TypeScript**: Full type safety across frontend and backend

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally OR MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd /root/my-first-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/futstocks
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

   Create `.env.local` file for Next.js:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**

   Development mode (runs both frontend and backend):
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Initial Setup

### 1. Create Admin Account
Register a regular account, then update the user in MongoDB to make them an admin:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)
```

### 2. Add Players (Admin Only)
1. Log in with your admin account
2. Navigate to `/admin`
3. Use the "Create Player" tab to add players
4. Example players:
   - **Erling Haaland** - Manchester City - FWD - $5000
   - **Mohamed Salah** - Liverpool - FWD - $4500
   - **Kevin De Bruyne** - Manchester City - MID - $4000
   - **Virgil van Dijk** - Liverpool - DEF - $3500
   - **Alisson** - Liverpool - GK - $3000

### 3. Create a Matchweek
1. Go to Admin Panel → "Manage Matchweek" tab
2. Create matchweek 1 with appropriate dates
3. This activates the first matchweek

### 4. Update Player Stats
After real matches occur:
1. Go to Admin Panel → "Update Stats" tab
2. Select a player and input their performance stats
3. System automatically calculates ROI and updates prices

## How It Works

### ROI Calculation
The system calculates ROI based on:
- **Goals**: Weighted by position (GK: 15%, DEF: 10%, MID: 7%, FWD: 5%)
- **Assists**: 5% per assist
- **Clean Sheets**: 8% for GK/DEF, 3% for MID
- **Minutes Played**: Participation bonuses
- **Match Rating**: 0-10 scale with bonuses for high ratings
- **Cards**: Penalties for yellow (-2%) and red cards (-10%)

### Price Updates
- Player prices change based on ROI each matchweek
- Price change = 50% of ROI value
- Popularity (number of investors) adds up to 50% additional change
- Minimum price floor of $50

### Portfolio Value
- **Total Wealth** = Portfolio Value + Cash Balance
- **Portfolio Value** = Sum of (Player Current Price × Quantity Held)
- **ROI** = ((Current Value - Invested Amount) / Invested Amount) × 100

## Project Structure

```
/root/my-first-project/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel page
│   ├── leaderboard/       # Leaderboard page
│   ├── login/             # Login page
│   ├── market/            # Player market page
│   ├── portfolio/         # Portfolio page
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   └── PlayerCard.tsx
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client
│   ├── auth-context.tsx  # Auth context provider
│   └── types.ts          # TypeScript types
├── server/               # Backend Express server
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Server entry point
├── public/              # Static assets
├── .env                 # Backend environment variables
├── .env.local           # Frontend environment variables
└── package.json         # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `GET /api/players/search?q=query` - Search players
- `GET /api/players/market-stats` - Get market statistics

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/buy` - Buy player shares
- `POST /api/portfolio/sell` - Sell player shares
- `GET /api/portfolio/transactions` - Get transaction history

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/rank/:userId` - Get user rank

### Admin (requires admin privileges)
- `POST /api/admin/players` - Create new player
- `PUT /api/admin/players/:id` - Update player
- `DELETE /api/admin/players/:id` - Delete player
- `POST /api/admin/players/:id/stats` - Update player stats
- `POST /api/admin/matchweeks` - Create matchweek
- `GET /api/admin/matchweeks/active` - Get active matchweek
- `POST /api/admin/matchweeks/:week/complete` - Complete matchweek

## Database Models

### User
- username, email, password (hashed)
- balance (starting: $10,000)
- isAdmin flag

### Player
- name, team, position
- currentPrice, initialPrice
- stats array (matchweek performance)
- totalROI, popularity, priceChangePercent

### Portfolio
- user reference
- holdings array (player, quantity, purchasePrice)
- totalValue, totalInvested, totalROI

### Transaction
- user and player references
- type (BUY/SELL), quantity, prices
- balanceBefore, balanceAfter

### Matchweek
- weekNumber, dates
- isActive, isCompleted flags

## Future Enhancements

- **Dark Mode**: Theme toggle for better UX
- **Friend Leaderboards**: Compete with specific friend groups
- **Bonus Rewards**: Weekly challenges and achievements
- **Player Statistics Graphs**: Historical performance charts
- **Live Notifications**: Real-time price change alerts
- **Mobile App**: React Native version
- **Social Features**: Comments, predictions, and discussions
- **Advanced Analytics**: Portfolio performance insights
- **Auto-trading**: Set buy/sell triggers
- **Multiple Leagues**: Support for different football leagues

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas, ensure IP is whitelisted

### Port Already in Use
- Change PORT in `.env` for backend
- Change port in `package.json` for frontend

### CORS Errors
- Ensure CLIENT_URL in `.env` matches frontend URL
- Check API_URL in `.env.local`

### Authentication Issues
- Clear browser cookies and localStorage
- Check JWT_SECRET is set in `.env`

## Contributing

This is a complete, production-ready application. Feel free to:
- Add new features
- Improve UI/UX
- Optimize performance
- Add tests
- Enhance documentation

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions, please check:
1. This README
2. Environment variable configuration
3. MongoDB connection
4. Console logs for specific errors

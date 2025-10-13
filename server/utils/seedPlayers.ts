import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player';
import connectDB from '../config/database';

dotenv.config();

const samplePlayers = [
  // Forwards
  { name: 'Erling Haaland', team: 'Manchester City', position: 'FWD', price: 5000 },
  { name: 'Mohamed Salah', team: 'Liverpool', position: 'FWD', price: 4500 },
  { name: 'Harry Kane', team: 'Bayern Munich', position: 'FWD', price: 4200 },
  { name: 'Kylian Mbappé', team: 'Real Madrid', position: 'FWD', price: 5500 },
  { name: 'Robert Lewandowski', team: 'Barcelona', position: 'FWD', price: 4000 },
  { name: 'Victor Osimhen', team: 'Napoli', position: 'FWD', price: 3800 },
  { name: 'Darwin Núñez', team: 'Liverpool', position: 'FWD', price: 3500 },
  { name: 'Julian Alvarez', team: 'Manchester City', position: 'FWD', price: 3200 },

  // Midfielders
  { name: 'Kevin De Bruyne', team: 'Manchester City', position: 'MID', price: 4500 },
  { name: 'Bruno Fernandes', team: 'Manchester United', position: 'MID', price: 3800 },
  { name: 'Martin Ødegaard', team: 'Arsenal', position: 'MID', price: 3600 },
  { name: 'Jude Bellingham', team: 'Real Madrid', position: 'MID', price: 4200 },
  { name: 'Rodri', team: 'Manchester City', position: 'MID', price: 3500 },
  { name: 'Declan Rice', team: 'Arsenal', position: 'MID', price: 3400 },
  { name: 'Bernardo Silva', team: 'Manchester City', position: 'MID', price: 3700 },
  { name: 'Phil Foden', team: 'Manchester City', position: 'MID', price: 3600 },

  // Defenders
  { name: 'Virgil van Dijk', team: 'Liverpool', position: 'DEF', price: 3500 },
  { name: 'Rúben Dias', team: 'Manchester City', position: 'DEF', price: 3300 },
  { name: 'William Saliba', team: 'Arsenal', position: 'DEF', price: 3200 },
  { name: 'Antonio Rüdiger', team: 'Real Madrid', position: 'DEF', price: 3000 },
  { name: 'Trent Alexander-Arnold', team: 'Liverpool', position: 'DEF', price: 3400 },
  { name: 'Kyle Walker', team: 'Manchester City', position: 'DEF', price: 2800 },
  { name: 'Josko Gvardiol', team: 'Manchester City', position: 'DEF', price: 3100 },
  { name: 'Ben White', team: 'Arsenal', position: 'DEF', price: 2900 },

  // Goalkeepers
  { name: 'Alisson', team: 'Liverpool', position: 'GK', price: 3000 },
  { name: 'Ederson', team: 'Manchester City', position: 'GK', price: 2900 },
  { name: 'David Raya', team: 'Arsenal', position: 'GK', price: 2600 },
  { name: 'Thibaut Courtois', team: 'Real Madrid', position: 'GK', price: 2700 },
  { name: 'André Onana', team: 'Manchester United', position: 'GK', price: 2500 },
  { name: 'Mike Maignan', team: 'AC Milan', position: 'GK', price: 2600 }
];

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing players
    await Player.deleteMany({});
    console.log('Cleared existing players');

    // Create players
    const players = samplePlayers.map(p => ({
      name: p.name,
      team: p.team,
      position: p.position as 'GK' | 'DEF' | 'MID' | 'FWD',
      currentPrice: p.price,
      initialPrice: p.price,
      imageUrl: '',
      stats: [],
      totalROI: 0,
      popularity: 0,
      priceChangePercent: 0
    }));

    await Player.insertMany(players);
    console.log(`✅ Seeded ${players.length} players successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();

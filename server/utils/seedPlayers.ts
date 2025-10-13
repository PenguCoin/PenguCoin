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
  { name: 'Bukayo Saka', team: 'Arsenal', position: 'FWD', price: 3900 },
  { name: 'Vinícius Júnior', team: 'Real Madrid', position: 'FWD', price: 4300 },
  { name: 'Rafael Leão', team: 'AC Milan', position: 'FWD', price: 3600 },
  { name: 'Gabriel Jesus', team: 'Arsenal', position: 'FWD', price: 3300 },
  { name: 'Lautaro Martínez', team: 'Inter Milan', position: 'FWD', price: 3700 },
  { name: 'Marcus Rashford', team: 'Manchester United', position: 'FWD', price: 3400 },
  { name: 'Son Heung-min', team: 'Tottenham', position: 'FWD', price: 3800 },
  { name: 'Dusan Vlahovic', team: 'Juventus', position: 'FWD', price: 3400 },
  { name: 'Christopher Nkunku', team: 'Chelsea', position: 'FWD', price: 3200 },
  { name: 'Ollie Watkins', team: 'Aston Villa', position: 'FWD', price: 3100 },

  // Midfielders
  { name: 'Kevin De Bruyne', team: 'Manchester City', position: 'MID', price: 4500 },
  { name: 'Bruno Fernandes', team: 'Manchester United', position: 'MID', price: 3800 },
  { name: 'Martin Ødegaard', team: 'Arsenal', position: 'MID', price: 3600 },
  { name: 'Jude Bellingham', team: 'Real Madrid', position: 'MID', price: 4200 },
  { name: 'Rodri', team: 'Manchester City', position: 'MID', price: 3500 },
  { name: 'Declan Rice', team: 'Arsenal', position: 'MID', price: 3400 },
  { name: 'Bernardo Silva', team: 'Manchester City', position: 'MID', price: 3700 },
  { name: 'Phil Foden', team: 'Manchester City', position: 'MID', price: 3600 },
  { name: 'Pedri', team: 'Barcelona', position: 'MID', price: 3500 },
  { name: 'Gavi', team: 'Barcelona', position: 'MID', price: 3300 },
  { name: 'Federico Valverde', team: 'Real Madrid', position: 'MID', price: 3400 },
  { name: 'Jamal Musiala', team: 'Bayern Munich', position: 'MID', price: 3800 },
  { name: 'İlkay Gündoğan', team: 'Barcelona', position: 'MID', price: 3200 },
  { name: 'Mason Mount', team: 'Manchester United', position: 'MID', price: 3000 },
  { name: 'James Maddison', team: 'Tottenham', position: 'MID', price: 3300 },
  { name: 'Enzo Fernández', team: 'Chelsea', position: 'MID', price: 3400 },

  // Defenders
  { name: 'Virgil van Dijk', team: 'Liverpool', position: 'DEF', price: 3500 },
  { name: 'Rúben Dias', team: 'Manchester City', position: 'DEF', price: 3300 },
  { name: 'William Saliba', team: 'Arsenal', position: 'DEF', price: 3200 },
  { name: 'Antonio Rüdiger', team: 'Real Madrid', position: 'DEF', price: 3000 },
  { name: 'Trent Alexander-Arnold', team: 'Liverpool', position: 'DEF', price: 3400 },
  { name: 'Kyle Walker', team: 'Manchester City', position: 'DEF', price: 2800 },
  { name: 'Josko Gvardiol', team: 'Manchester City', position: 'DEF', price: 3100 },
  { name: 'Ben White', team: 'Arsenal', position: 'DEF', price: 2900 },
  { name: 'Marquinhos', team: 'PSG', position: 'DEF', price: 3100 },
  { name: 'Eder Militão', team: 'Real Madrid', position: 'DEF', price: 3000 },
  { name: 'Theo Hernández', team: 'AC Milan', position: 'DEF', price: 3000 },
  { name: 'João Cancelo', team: 'Barcelona', position: 'DEF', price: 2900 },
  { name: 'Andrew Robertson', team: 'Liverpool', position: 'DEF', price: 2900 },
  { name: 'Gabriel Magalhães', team: 'Arsenal', position: 'DEF', price: 3000 },
  { name: 'Kim Min-jae', team: 'Bayern Munich', position: 'DEF', price: 2900 },
  { name: 'Lisandro Martínez', team: 'Manchester United', position: 'DEF', price: 2800 },

  // Goalkeepers
  { name: 'Alisson', team: 'Liverpool', position: 'GK', price: 3000 },
  { name: 'Ederson', team: 'Manchester City', position: 'GK', price: 2900 },
  { name: 'David Raya', team: 'Arsenal', position: 'GK', price: 2600 },
  { name: 'Thibaut Courtois', team: 'Real Madrid', position: 'GK', price: 2700 },
  { name: 'André Onana', team: 'Manchester United', position: 'GK', price: 2500 },
  { name: 'Mike Maignan', team: 'AC Milan', position: 'GK', price: 2600 },
  { name: 'Marc-André ter Stegen', team: 'Barcelona', position: 'GK', price: 2700 },
  { name: 'Gianluigi Donnarumma', team: 'PSG', position: 'GK', price: 2600 },
  { name: 'Diogo Costa', team: 'Porto', position: 'GK', price: 2400 },
  { name: 'Emiliano Martínez', team: 'Aston Villa', position: 'GK', price: 2700 }
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

import express from 'express';
import {
  createPlayer,
  updatePlayer,
  updatePlayerStats,
  deletePlayer,
  createMatchweek,
  completeMatchweek,
  getActiveMatchweek
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Player management
router.post('/players', createPlayer);
router.put('/players/:playerId', updatePlayer);
router.delete('/players/:playerId', deletePlayer);
router.post('/players/:playerId/stats', updatePlayerStats);

// Matchweek management
router.post('/matchweeks', createMatchweek);
router.get('/matchweeks/active', getActiveMatchweek);
router.post('/matchweeks/:weekNumber/complete', completeMatchweek);

export default router;

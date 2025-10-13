import express from 'express';
import {
  getAllPlayers,
  getPlayer,
  getMarketStats,
  searchPlayers
} from '../controllers/playerController';

const router = express.Router();

router.get('/', getAllPlayers);
router.get('/search', searchPlayers);
router.get('/market-stats', getMarketStats);
router.get('/:id', getPlayer);

export default router;

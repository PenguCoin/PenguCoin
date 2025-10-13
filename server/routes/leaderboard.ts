import express from 'express';
import { getLeaderboard, getUserRank } from '../controllers/leaderboardController';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/rank/:userId', getUserRank);

export default router;

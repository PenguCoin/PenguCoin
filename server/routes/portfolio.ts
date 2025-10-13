import express from 'express';
import {
  getPortfolio,
  buyPlayer,
  sellPlayer,
  getTransactions
} from '../controllers/portfolioController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getPortfolio);
router.post('/buy', buyPlayer);
router.post('/sell', sellPlayer);
router.get('/transactions', getTransactions);

export default router;

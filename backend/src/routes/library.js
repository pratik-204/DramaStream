import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
    addWatchlistItem,
    getWatchHistory,
    getWatchHistoryItem,
    getWatchlist,
    getWatchlistItem,
    markWatchHistoryCompleted,
    removeWatchlistItem,
    upsertWatchHistoryItem,
} from '../controllers/libraryController.js';
import { watchlistSchema, watchHistorySchema } from '../schemas/librarySchemas.js';

const router = express.Router();

router.get('/me/watchlist', authMiddleware, getWatchlist);
router.get('/me/watchlist/:dramaId', authMiddleware, getWatchlistItem);
router.post('/me/watchlist', authMiddleware, validateBody(watchlistSchema), addWatchlistItem);
router.delete('/me/watchlist/:dramaId', authMiddleware, removeWatchlistItem);

router.get('/me/watch-history', authMiddleware, getWatchHistory);
router.get('/me/watch-history/:episodeId', authMiddleware, getWatchHistoryItem);
router.put('/me/watch-history', authMiddleware, validateBody(watchHistorySchema), upsertWatchHistoryItem);
router.patch('/me/watch-history/:episodeId/completed', authMiddleware, markWatchHistoryCompleted);

export default router;
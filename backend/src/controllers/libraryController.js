import Content from '../models/Content.js';
import WatchHistory from '../models/WatchHistory.js';
import Watchlist from '../models/Watchlist.js';

const normalizeContentRef = (doc) => {
    if (!doc) return null;
    const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
        ...item,
        id: String(item._id || item.id),
    };
};

const buildEpisodeKey = (dramaId, episodeNumber) => `${dramaId}:${episodeNumber}`;

const normalizeHistoryRecord = (doc) => {
    if (!doc) return null;
    const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    const dramaId = item.dramaId && typeof item.dramaId === 'object'
        ? String(item.dramaId._id || item.dramaId.id)
        : String(item.dramaId);
    return {
        ...item,
        id: String(item._id || item.id),
        dramaId,
    };
};

const withDrama = (doc) => {
    const item = normalizeHistoryRecord(doc);
    return {
        ...item,
        drama: normalizeContentRef(doc?.dramaId),
    };
};

export const getWatchlist = async (req, res) => {
    try {
        const items = await Watchlist.find({ userId: req.userId })
            .populate('dramaId')
            .sort({ createdAt: -1 });

        return res.json({
            items: items.map((item) => ({
                ...item.toJSON(),
                drama: normalizeContentRef(item.dramaId),
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
};

export const getWatchlistItem = async (req, res) => {
    try {
        const { dramaId } = req.params;
        const item = await Watchlist.findOne({ userId: req.userId, dramaId }).populate('dramaId');
        if (!item) return res.status(404).json({ message: 'Watchlist item not found' });
        return res.json({ item: { ...item.toJSON(), drama: normalizeContentRef(item.dramaId) } });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch watchlist item' });
    }
};

export const addWatchlistItem = async (req, res) => {
    try {
        const dramaId = String(req.body?.dramaId || '').trim();
        if (!dramaId) return res.status(400).json({ message: 'dramaId is required' });

        const content = await Content.findById(dramaId);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        const existing = await Watchlist.findOne({ userId: req.userId, dramaId });
        if (existing) {
            await existing.populate('dramaId');
            return res.json({
                message: 'Already in watchlist',
                item: { ...existing.toJSON(), drama: normalizeContentRef(existing.dramaId) },
            });
        }

        const item = await Watchlist.create({ userId: req.userId, dramaId });
        await item.populate('dramaId');

        return res.status(201).json({
            message: 'Added to watchlist',
            item: { ...item.toJSON(), drama: normalizeContentRef(item.dramaId) },
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Already in watchlist' });
        }
        return res.status(500).json({ message: 'Failed to add watchlist item' });
    }
};

export const removeWatchlistItem = async (req, res) => {
    try {
        const { dramaId } = req.params;
        const deleted = await Watchlist.findOneAndDelete({ userId: req.userId, dramaId });
        if (!deleted) return res.status(404).json({ message: 'Watchlist item not found' });
        return res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to remove watchlist item' });
    }
};

export const getWatchHistoryItem = async (req, res) => {
    try {
        const { episodeId } = req.params;
        const item = await WatchHistory.findOne({ userId: req.userId, episodeId }).populate('dramaId');
        if (!item) return res.status(404).json({ message: 'Watch history item not found' });
        return res.json({ item: withDrama(item) });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch watch history item' });
    }
};

export const getWatchHistory = async (req, res) => {
    try {
        const items = await WatchHistory.find({ userId: req.userId })
            .populate('dramaId')
            .sort({ lastWatchedTimestamp: -1, updatedAt: -1 });

        return res.json({
            items: items.map((item) => withDrama(item)),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch watch history' });
    }
};

export const upsertWatchHistoryItem = async (req, res) => {
    try {
        const dramaId = String(req.body?.dramaId || '').trim();
        const episodeNumber = Number(req.body?.episodeNumber);
        const episodeTitle = String(req.body?.episodeTitle || '').trim();
        const episodeId = String(req.body?.episodeId || '').trim() || buildEpisodeKey(dramaId, episodeNumber);

        if (!dramaId) return res.status(400).json({ message: 'dramaId is required' });
        if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
            return res.status(400).json({ message: 'episodeNumber is required' });
        }

        const content = await Content.findById(dramaId);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        const payload = {
            userId: req.userId,
            dramaId,
            episodeId,
            episodeNumber,
            episodeTitle,
            lastWatchedTimestamp: Math.floor(Date.now() / 1000),
        };

        const item = await WatchHistory.findOneAndUpdate(
            { userId: req.userId, episodeId },
            { $set: payload, $setOnInsert: { completed: false } },
            { new: true, upsert: true, runValidators: true }
        );

        await item.populate('dramaId');

        return res.json({ message: 'Watch history saved', item: withDrama(item) });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save watch history' });
    }
};

export const markWatchHistoryCompleted = async (req, res) => {
    try {
        const { episodeId } = req.params;
        const item = await WatchHistory.findOneAndUpdate(
            { userId: req.userId, episodeId },
            { $set: { completed: true, lastWatchedTimestamp: Math.floor(Date.now() / 1000) } },
            { new: true }
        );

        if (!item) return res.status(404).json({ message: 'Watch history item not found' });
        await item.populate('dramaId');
        return res.json({ message: 'Marked completed', item: withDrama(item) });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to mark completed' });
    }
};
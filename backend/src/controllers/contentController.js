import Content from "../models/Content.js";

const VALID_TYPES = ["movie", "series", "anime"];
const VALID_COUNTRIES = [
    "South Korea",
    "Japan",
    "China",
    "Thailand",
    "India",
    "USA",
    "Taiwan",
    "Philippines",
    "France"
];

const normalizeEpisodes = (episodes = []) => {
    return [...episodes]
        .sort((a, b) => Number(a?.episodeNumber || 0) - Number(b?.episodeNumber || 0))
        .map((ep) => {
            let servers = ep.servers;
            if (!servers || servers.length === 0) {
                if (ep.videoUrl) {
                    servers = [
                        { name: "Default", url: ep.videoUrl }
                    ];
                } else {
                    servers = [];
                }
            }
            return {
                ...ep,
                servers
            };
        });
};

const normalizeContent = (doc) => {
    if (!doc) return null;
    const item = typeof doc.toObject === "function" ? doc.toObject() : doc;
    let seasons = [];

    if (Array.isArray(item.seasons) && item.seasons.length > 0) {
        seasons = item.seasons.map((s) => ({
            ...s,
            episodes: normalizeEpisodes(s.episodes)
        }));
    } else {
        seasons = [
            {
                seasonNumber: 1,
                episodes: normalizeEpisodes(item.episodes || [])
            }
        ];
    }

    return {
        ...item,
        id: String(item._id || item.id),
        seasons
    };
};

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeGenre = (genre) => {
    if (Array.isArray(genre)) return genre.map((g) => String(g).trim()).filter(Boolean);
    if (typeof genre === "string" && genre.trim()) return genre.split(",").map((g) => g.trim()).filter(Boolean);
    return [];
};

const buildContentPayload = (body = {}) => {
    const src = (body && body.item) ? body.item : body;
    const has = (prop) => Object.prototype.hasOwnProperty.call(src || {}, prop);

    const payload = {};
    if (has('title')) payload.title = String(src.title || "").trim();
    if (has('type')) payload.type = String(src.type || "").trim().toLowerCase();
    if (has('description')) payload.description = String(src.description || "").trim();
    if (has('thumbnail') || has('posterUrl')) payload.thumbnail = String(src.thumbnail || src.posterUrl || "").trim();
    if (has('trailerUrl')) payload.trailerUrl = String(src.trailerUrl || "").trim();
    if (has('genre')) payload.genre = normalizeGenre(src.genre);
    if (has('countries')) {
        const countries = Array.isArray(src.countries) ? src.countries : [];
        payload.countries = countries
            .map((country) => String(country).trim())
            .filter((country) => VALID_COUNTRIES.includes(country));
    }
    if (has('releaseYear')) {
        const y = Number.parseInt(src.releaseYear, 10);
        if (Number.isFinite(y)) payload.releaseYear = y;
    }
    if (has('rating')) {
        const r = Number.parseFloat(src.rating);
        if (Number.isFinite(r)) payload.rating = r;
    }
    if (has('source')) payload.source = String(src.source || "manual").trim();
    if (has('episodes')) payload.episodes = Array.isArray(src.episodes) ? src.episodes : [];
    if (has('tmdbId')) payload.tmdbId = src.tmdbId !== undefined && src.tmdbId !== null && src.tmdbId !== "" ? Number(src.tmdbId) : undefined;

    return payload;
};

export const getFeaturedContent = async (req, res) => {
    try {
        const limit = parsePositiveInt(req.query.limit, 5);
        const records = await Content.find({}).sort({ rating: -1, views: -1, createdAt: -1 }).limit(limit);
        return res.json({ items: records.map(normalizeContent) });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch featured content' });
    }
};

export const getTrendingContent = async (req, res) => {
    try {
        const limit = parsePositiveInt(req.query.limit, 12);
        const hasViews = await Content.exists({
            $or: [
                { views: { $gt: 0 } },
                { viewsLast24h: { $gt: 0 } }
            ]
        });

        let records;

        if (hasViews) {
            records = await Content.find({})
                .sort({
                    viewsLast24h: -1,
                    views: -1,
                    rating: -1,
                    createdAt: -1
                })
                .limit(limit);
        } else {
            records = await Content.find({})
                .sort({
                    rating: -1,
                    createdAt: -1
                })
                .limit(limit);
        }
        return res.json({ items: records.map(normalizeContent) });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch trending content' });
    }
};

export const getSimilarContent = async (req, res) => {
    try {
        const { id } = req.params;

        const current = await Content.findById(id);

        if (!current) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        const records = await Content.find({
            _id: { $ne: id },
            type: current.type
        }).limit(50);

        const scored = records.map((item) => {

            let score = 0;

            // Genre match
            const commonGenres = (item.genre || []).filter(g =>
                (current.genre || []).includes(g)
            );

            score += commonGenres.length * 10;

            // Country match
            const sameCountry = (item.countries || []).some(c =>
                (current.countries || []).includes(c)
            );

            if (sameCountry) {
                score += 15;
            }

            // Rating similarity
            const ratingDiff = Math.abs(
                Number(item.rating || 0) -
                Number(current.rating || 0)
            );

            score += Math.max(0, 10 - ratingDiff);

            // Trending bonus
            score += Math.min(
                20,
                Number(item.viewsLast24h || 0) / 100
            );

            return {
                score,
                item
            };
        });

        const sorted = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map((entry) => normalizeContent(entry.item));

        return res.json({
            items: sorted
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Failed to fetch similar content"
        });
    }
};

export const getTop10ByType = async (req, res) => {
    try {
        const type = String(req.query.type || "").toLowerCase();
        if (!VALID_TYPES.includes(type)) return res.status(400).json({ message: 'Invalid type' });
        const records = await Content.find({ type }).sort({ rating: -1, views: -1, createdAt: -1 }).limit(10);
        return res.json({ items: records.map(normalizeContent) });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch top10' });
    }
};

export const getContentList = async (req, res) => {
    try {
        const { type, genre, language, year, rating, page = '1', limit = '1000' } = req.query;
        const filter = {};
        if (type && VALID_TYPES.includes(String(type).toLowerCase())) filter.type = String(type).toLowerCase();
        if (genre) filter.genre = { $in: [String(genre)] };
        if (language) filter.language = String(language);
        if (year) {
            const y = Number.parseInt(year, 10);
            if (Number.isFinite(y)) filter.releaseYear = y;
        }
        if (rating) {
            const r = Number.parseFloat(rating);
            if (Number.isFinite(r)) filter.rating = { $gte: r };
        }

        const p = parsePositiveInt(page, 1);
        const l = parsePositiveInt(limit, 1000);
        const skip = (p - 1) * l;

        const [records, total] = await Promise.all([
            Content.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
            Content.countDocuments(filter)
        ]);

        return res.json({ items: records.map(normalizeContent), pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) || 1 } });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch list' });
    }
};

export const searchContent = async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();

        if (!q) {
            return res.json({ items: [] });
        }

        const regex = new RegExp(q, 'i');

        const records = await Content.find({
            title: regex
        }).sort({ createdAt: -1 });

        return res.json({
            items: records.map(normalizeContent)
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Search failed'
        });
    }
};

export const getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Content.findById(id);
        if (!record) return res.status(404).json({ message: 'Content not found' });
        return res.json({ item: normalizeContent(record) });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch content' });
    }
};

export const updateContentTrailer = async (req, res) => {
    try {
        const { id } = req.params;
        const trailerUrl = String(req.body?.trailerUrl || '').trim();
        if (trailerUrl) {
            try { const p = new URL(trailerUrl); if (!['http:', 'https:'].includes(p.protocol)) return res.status(400).json({ message: 'Invalid protocol' }); } catch { return res.status(400).json({ message: 'Invalid URL' }); }
        }
        const record = await Content.findByIdAndUpdate(id, { $set: { trailerUrl } }, { new: true });
        if (!record) return res.status(404).json({ message: 'Content not found' });
        return res.json({ message: 'Trailer updated', item: normalizeContent(record) });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update trailer' });
    }
};

export const addEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const { seasonNumber, episode, episodes, episodeNumber, update } = req.body;

        if (update) {
            if (!seasonNumber || !episodeNumber || !update) {
                return res.status(400).json({ message: "Invalid data" });
            }

            const setObj = {};

            if (update.title !== undefined) {
                setObj["seasons.$[season].episodes.$[ep].title"] = update.title;
            }

            if (update.videoUrl !== undefined) {
                setObj["seasons.$[season].episodes.$[ep].videoUrl"] = update.videoUrl;
            }

            if (update.thumbnail !== undefined) {
                setObj["seasons.$[season].episodes.$[ep].thumbnail"] = update.thumbnail;
            }

            if (update.servers !== undefined) {
                setObj["seasons.$[season].episodes.$[ep].servers"] = update.servers;
            }

            const record = await Content.findOneAndUpdate(
                {
                    _id: id,
                    "seasons.seasonNumber": seasonNumber,
                    "seasons.episodes.episodeNumber": episodeNumber
                },
                {
                    $set: setObj
                },
                {
                    arrayFilters: [
                        { "season.seasonNumber": seasonNumber },
                        { "ep.episodeNumber": episodeNumber }
                    ],
                    new: true
                }
            );

            return res.json({ message: "Episode updated", item: record });
        }

        const episodesToAdd = episodes || (episode ? [episode] : []);

        if (!seasonNumber || episodesToAdd.length === 0) {
            return res.status(400).json({ message: "Invalid data" });
        }

        const normalizedSeasonNumber = Number(seasonNumber);
        if (!Number.isFinite(normalizedSeasonNumber)) {
            return res.status(400).json({ message: "Invalid season number" });
        }

        const normalizedEpisodesToAdd = episodesToAdd.map((ep) => ({
            ...ep,
            episodeNumber: Number(ep?.episodeNumber)
        }));

        const incomingNumbers = new Set();
        for (const ep of normalizedEpisodesToAdd) {
            const episodeNum = Number(ep?.episodeNumber);
            if (!Number.isFinite(episodeNum)) {
                return res.status(400).json({ message: "Invalid episode number" });
            }
            if (incomingNumbers.has(episodeNum)) {
                return res.status(409).json({ message: `Duplicate episodeNumber in request: ${episodeNum}` });
            }
            incomingNumbers.add(episodeNum);
        }

        const existingSeason = await Content.findOne(
            { _id: id, "seasons.seasonNumber": normalizedSeasonNumber },
            { seasons: 1 }
        ).lean();

        const existingNumbers = new Set(
            existingSeason?.seasons
                ?.find((s) => Number(s.seasonNumber) === normalizedSeasonNumber)
                ?.episodes?.map((ep) => Number(ep.episodeNumber)) || []
        );

        for (const ep of normalizedEpisodesToAdd) {
            const episodeNum = Number(ep?.episodeNumber);
            if (existingNumbers.has(episodeNum)) {
                return res.status(409).json({ message: `Episode ${episodeNum} already exists` });
            }
            existingNumbers.add(episodeNum);
        }

        const episodeNumbers = normalizedEpisodesToAdd.map((ep) => Number(ep.episodeNumber));
        const sortedEpisodesToAdd = [...normalizedEpisodesToAdd].sort(
            (a, b) => Number(a?.episodeNumber || 0) - Number(b?.episodeNumber || 0)
        );

        let record = await Content.findOneAndUpdate(
            {
                _id: id,
                seasons: {
                    $elemMatch: {
                        seasonNumber: normalizedSeasonNumber,
                        "episodes.episodeNumber": { $nin: episodeNumbers }
                    }
                }
            },
            {
                $push: {
                    "seasons.$.episodes": {
                        $each: sortedEpisodesToAdd,
                        $sort: { episodeNumber: 1 }
                    }
                }
            },
            { new: true }
        );

        if (!record) {
            record = await Content.findOneAndUpdate(
                {
                    _id: id,
                    seasons: { $not: { $elemMatch: { seasonNumber: normalizedSeasonNumber } } }
                },
                {
                    $push: {
                        seasons: {
                            seasonNumber: normalizedSeasonNumber,
                            episodes: sortedEpisodesToAdd
                        }
                    }
                },
                { new: true }
            );
        }

        if (!record) {
            const contentExists = await Content.exists({ _id: id });
            if (!contentExists) {
                return res.status(404).json({ message: "Content not found" });
            }
            return res.status(409).json({ message: "Episode already exists" });
        }

        res.json({ message: "Episodes added", item: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed" });
    }
};

export const updateEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const { seasonNumber, episodeNumber, update } = req.body;

        if (!seasonNumber || !episodeNumber || !update) {
            return res.status(400).json({ message: "Invalid data" });
        }

        const setObj = {};

        if (update.title !== undefined) {
            setObj["seasons.$[season].episodes.$[ep].title"] = update.title;
        }

        if (update.videoUrl !== undefined) {
            setObj["seasons.$[season].episodes.$[ep].videoUrl"] = update.videoUrl;
        }

        if (update.servers !== undefined) {
            setObj["seasons.$[season].episodes.$[ep].servers"] = update.servers;
        }

        if (update.thumbnail !== undefined) {
            setObj["seasons.$[season].episodes.$[ep].thumbnail"] = update.thumbnail;
        }

        const record = await Content.findOneAndUpdate(
            {
                _id: id,
                "seasons.seasonNumber": seasonNumber,
                "seasons.episodes.episodeNumber": episodeNumber
            },
            {
                $set: setObj
            },
            {
                arrayFilters: [
                    { "season.seasonNumber": seasonNumber },
                    { "ep.episodeNumber": episodeNumber }
                ],
                new: true
            }
        );

        res.json({ message: "Episode updated", item: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update episode" });
    }
};

export const migrateAllContent = async (req, res) => {
    try {
        const contents = await Content.find();

        let updatedCount = 0;

        for (let content of contents) {
            if (!content.episodes || content.episodes.length === 0) continue;

            if (!content.seasons) content.seasons = [];

            let season1 = content.seasons.find(
                (s) => s.seasonNumber === 1
            );

            if (!season1) {
                season1 = {
                    seasonNumber: 1,
                    episodes: []
                };
                content.seasons.push(season1);
            }

            const existingEpisodeNumbers = new Set(
                season1.episodes.map((ep) => ep.episodeNumber)
            );

            const newEpisodes = content.episodes.filter(
                (ep) => !existingEpisodeNumbers.has(ep.episodeNumber)
            );

            season1.episodes.push(...newEpisodes);

            content.episodes = [];

            await content.save();
            updatedCount++;
        }

        res.json({
            message: "Migration done safely",
            updated: updatedCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to migrate content" });
    }
};

export const deleteEpisode = async (req, res) => {
    try {
        const { id, seasonNumber, episodeNumber } = req.params;

        const record = await Content.findOneAndUpdate(
            {
                _id: id,
                "seasons.seasonNumber": Number(seasonNumber)
            },
            {
                $pull: {
                    "seasons.$.episodes": {
                        episodeNumber: Number(episodeNumber)
                    }
                }
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ message: "Episode not found" });
        }

        res.json({ message: "Episode deleted", item: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed" });
    }
};

export const deleteContent = async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed" });
    }
};

export const createContent = async (req, res) => {
    try {
        const payload = buildContentPayload(req.body);
        if (!payload.title) return res.status(400).json({ message: 'Title is required' });
        if (!VALID_TYPES.includes(payload.type)) return res.status(400).json({ message: 'Invalid type' });
        const record = await Content.create(payload);
        return res.status(201).json({ message: 'Created', item: normalizeContent(record) });
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ message: 'Already exists' });
        return res.status(500).json({ message: 'Failed to create' });
    }
};

export const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = buildContentPayload(req.body);
        if (payload.type && !VALID_TYPES.includes(payload.type)) return res.status(400).json({ message: 'Invalid type' });
        const clean = {};
        Object.keys(payload || {}).forEach(k => { const v = payload[k]; if (v !== undefined) clean[k] = v; });
        if (Object.keys(clean).length === 0) return res.status(400).json({ message: 'No fields' });
        const record = await Content.findByIdAndUpdate(id, { $set: clean }, { new: true, runValidators: true });
        if (!record) return res.status(404).json({ message: 'Not found' });
        return res.json({ message: 'Updated', item: normalizeContent(record) });
    } catch (err) {
        console.error('updateContent error', err);
        if (err?.code === 11000) return res.status(409).json({ message: 'Already exists' });
        return res.status(500).json({ message: 'Failed to update', error: String(err.message || err) });
    }
};

export default null;

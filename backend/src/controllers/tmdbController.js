import Content from "../models/Content.js";
import {
    fetchTrailerUrl,
    fetchPopularSeries,
    fetchPopularMovies
} from "../services/tmdbService.js";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TRAILER_CONCURRENCY = 2;

const mapWithConcurrency = async (items, limit, mapper) => {
    const results = new Array(items.length);
    let index = 0;

    const worker = async () => {
        while (index < items.length) {
            const current = index;
            index += 1;
            results[current] = await mapper(items[current], current);
        }
    };

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        worker
    );

    await Promise.all(workers);
    return results;
};

export const importSeries = async (req, res) => {
    try {
        const series = await fetchPopularSeries();

        const formatted = await mapWithConcurrency(
            series,
            TRAILER_CONCURRENCY,
            async (s) => {
                let trailerUrl = "";

                try {
                    // 🔥 ALWAYS FETCH TRAILER
                    trailerUrl = await fetchTrailerUrl("series", s.id);
                } catch {
                    trailerUrl = "";
                }

                return {
                    tmdbId: s.id,
                    title: s.name,
                    type: "series",

                    thumbnail: s.poster_path
                        ? `${IMAGE_BASE}${s.poster_path}`
                        : "",

                    rating: s.vote_average,

                    releaseYear:
                        Number.parseInt(
                            s.first_air_date?.split("-")[0],
                            10
                        ) || undefined,

                    description: s.overview,

                    // ✅ Trailer saved
                    trailerUrl,

                    source: "tmdb"
                };
            }
        );

        for (const item of formatted) {
            await Content.updateOne(
                { tmdbId: item.tmdbId },
                { $set: item },
                { upsert: true }
            );
        }

        res.json({
            message: "Series imported successfully",
            imported: formatted.length
        });

    } catch (error) {
        const message =
            error?.response?.data?.status_message ||
            error?.message ||
            "Failed to import series from TMDB";

        res.status(500).json({ error: message });
    }
};

const extractStreamtapeId = (url) => {
    try {
        const u = new URL(url);
        // streamtape urls like https://streamtape.com/e/abcd1234
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.indexOf("e");
        if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
        // fallback: last segment
        return parts[parts.length - 1] || null;
    } catch {
        return null;
    }
};

const buildStreamtapeUrl = (id) => (id ? `https://streamtape.com/e/${id}` : "");

const buildStreamtapeThumb = (id) => (id ? `https://streamtape.com/get_video?id=${id}` : "");

const normalizeEpisodeEntry = (entry) => {
    if (!entry) return null;

    if (typeof entry === "string") {
        const id = extractStreamtapeId(entry);
        return id
            ? { source: "streamtape", url: buildStreamtapeUrl(id), thumbnail: buildStreamtapeThumb(id) }
            : { source: "unknown", url: entry };
    }

    const out = {};
    if (entry.url) {
        out.url = String(entry.url);
        const id = extractStreamtapeId(out.url);
        if (id) {
            out.source = "streamtape";
            out.thumbnail = buildStreamtapeThumb(id);
        }
    }

    if (entry.title) out.title = String(entry.title);
    if (entry.episodeNumber !== undefined) out.episodeNumber = Number(entry.episodeNumber);
    if (entry.duration) out.duration = entry.duration;

    return out;
};

export const importMovie = async (req, res) => {
    try {
        const movies = await fetchPopularMovies();

        const formatted = await mapWithConcurrency(
            movies,
            TRAILER_CONCURRENCY,
            async (m) => {
                let trailerUrl = "";

                try {
                    // 🔥 ALWAYS FETCH TRAILER
                    trailerUrl = await fetchTrailerUrl("movie", m.id);
                } catch {
                    trailerUrl = "";
                }

                return {
                    tmdbId: m.id,
                    title: m.title,
                    type: "movie",

                    thumbnail: m.poster_path
                        ? `${IMAGE_BASE}${m.poster_path}`
                        : "",

                    rating: m.vote_average,

                    releaseYear:
                        Number.parseInt(
                            m.release_date?.split("-")[0],
                            10
                        ) || undefined,

                    description: m.overview,

                    // ✅ Trailer saved
                    trailerUrl,

                    source: "tmdb"
                };
            }
        );

        for (const item of formatted) {
            await Content.updateOne(
                { tmdbId: item.tmdbId },
                { $set: item },
                { upsert: true }
            );
        }

        res.json({
            message: "Movies imported successfully",
            imported: formatted.length
        });

    } catch (error) {
        const message =
            error?.response?.data?.status_message ||
            error?.message ||
            "Failed to import movies from TMDB";

        res.status(500).json({ error: message });
    }
};

export const addEpisodesFromLinks = async (req, res) => {
    try {
        const { id } = req.params; // content id
        const { links, episodes } = req.body || {};

        let arr = [];
        if (Array.isArray(episodes) && episodes.length) arr = episodes.map(normalizeEpisodeEntry).filter(Boolean);
        else if (Array.isArray(links) && links.length) arr = links.map((l) => normalizeEpisodeEntry(l)).filter(Boolean);

        if (!arr.length) {
            return res.status(400).json({ message: "No episodes or links provided" });
        }

        const record = await Content.findById(id);
        if (!record) return res.status(404).json({ message: "Content not found" });

        // merge: append episodes preserving order; if episodeNumber present, set explicitly
        const existing = Array.isArray(record.episodes) ? record.episodes.slice() : [];
        for (const e of arr) {
            existing.push(e);
        }

        record.episodes = existing;
        await record.save();

        return res.json({ message: "Episodes added", item: record });
    } catch (error) {
        console.error('addEpisodesFromLinks error:', error);
        return res.status(500).json({ message: "Failed to add episodes" });
    }
};
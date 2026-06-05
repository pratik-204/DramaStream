import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectDB from '../src/config/db.js';
import { fetchPopularSeries, fetchTrailerUrl } from '../src/services/tmdbService.js';
import Content from '../src/models/Content.js';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP = {
    18: 'drama',
    35: 'comedy',
    10759: 'action',
    9648: 'mystery',
    10765: 'sci-fi',
    10751: 'family'
};

const run = async () => {
    try {
        await connectDB();
        console.log('Fetching popular series from TMDB...');
        const series = await fetchPopularSeries();

        const items = series.map((s) => ({
            tmdbId: s.id,
            title: s.name,
            type: 'series',
            genre: s.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean),
            thumbnail: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : '',
            rating: s.vote_average,
            releaseYear: Number.parseInt(s.first_air_date?.split('-')[0], 10) || undefined,
            description: s.overview,
            trailerUrl: '',
            source: 'tmdb'
        }));

        for (const item of items) {
            await Content.updateOne({ tmdbId: item.tmdbId }, { $set: item }, { upsert: true });
        }

        console.log(`Imported ${items.length} items.`);
        process.exit(0);
    } catch (err) {
        console.error('Import failed:', err);
        process.exit(1);
    }
};

run();

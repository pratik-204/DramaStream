import { z } from 'zod';

const validTypes = z.enum(['movie', 'series', 'anime']);

const urlField = z.string().url({ message: 'Must be a valid URL' }).optional();

const serverSchema = z.object({
    name: z.string().min(1, { message: 'Server name is required' }),
    url: z.string().url({ message: 'Server URL must be valid' }),
});

const episodeSchema = z.object({
    title: z.string().min(1).optional(),
    videoUrl: z.string().url({ message: 'videoUrl must be a valid URL' }).optional(),
    thumbnail: z.string().url({ message: 'thumbnail must be a valid URL' }).optional(),
    episodeNumber: z.preprocess((value) => Number(value), z.number().int().positive({ message: 'episodeNumber must be a positive integer' })),
    servers: z.array(serverSchema).optional(),
});

const contentBase = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    type: validTypes,
    description: z.string().max(5000).optional(),
    thumbnail: urlField,
    posterUrl: urlField,
    trailerUrl: urlField,
    genre: z.array(z.string().min(1)).optional(),
    countries: z.array(z.string().min(1)).optional(),
    releaseYear: z.preprocess((value) => Number(value), z.number().int().gte(1900).lte(2100).optional()),
    rating: z.preprocess((value) => Number(value), z.number().gte(0).lte(10).optional()),
    source: z.string().optional(),
    episodes: z.array(episodeSchema).optional(),
    tmdbId: z.preprocess((value) => Number(value), z.number().int().positive().optional()),
});

export const createContentSchema = contentBase;
export const updateContentSchema = contentBase.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export const updateTrailerSchema = z.object({
    trailerUrl: urlField,
});

export const addEpisodeSchema = z.object({
    seasonNumber: z.preprocess((value) => Number(value), z.number().int().positive({ message: 'seasonNumber must be a positive integer' })),
    episode: episodeSchema.optional(),
    episodes: z.array(episodeSchema).optional(),
    episodeNumber: z.preprocess((value) => Number(value), z.number().int().positive().optional()),
    update: z.object({
        title: z.string().min(1).optional(),
        videoUrl: z.string().url().optional(),
        thumbnail: z.string().url().optional(),
        servers: z.array(serverSchema).optional(),
    }).optional(),
}).refine((data) => {
    if (data.update) return true;
    if (data.episodes?.length > 0) return true;
    if (data.episode) return true;
    return false;
}, { message: 'Either episode, episodes, or update payload is required' });

export const updateEpisodeSchema = z.object({
    seasonNumber: z.preprocess((value) => Number(value), z.number().int().positive({ message: 'seasonNumber must be a positive integer' })),
    episodeNumber: z.preprocess((value) => Number(value), z.number().int().positive({ message: 'episodeNumber must be a positive integer' })),
    update: z.object({
        title: z.string().min(1).optional(),
        videoUrl: z.string().url().optional(),
        thumbnail: z.string().url().optional(),
        servers: z.array(serverSchema).optional(),
    }),
});

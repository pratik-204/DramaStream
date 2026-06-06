import { z } from 'zod';

export const watchlistSchema = z.object({
    dramaId: z.string().min(1, { message: 'dramaId is required' }),
});

export const watchHistorySchema = z.object({
    dramaId: z.string().min(1, { message: 'dramaId is required' }),
    episodeNumber: z.preprocess((value) => Number(value), z.number().int().positive({ message: 'episodeNumber must be a positive integer' })),
    episodeTitle: z.string().min(1, { message: 'episodeTitle is required' }),
    episodeId: z.string().optional(),
});

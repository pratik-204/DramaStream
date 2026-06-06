import { z } from 'zod';

export const signupSchema = z.object({
    username: z.string().min(2, { message: 'Username must be at least 2 characters' }).optional(),
    email: z.string().email({ message: 'Valid email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export const loginSchema = z.object({
    email: z.string().email({ message: 'Valid email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

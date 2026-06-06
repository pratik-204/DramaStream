import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    MONGO_URI: z.string().min(1, { message: 'MONGO_URI is required' }),
    PORT: z.string().min(1, { message: 'PORT is required' }),
});

const env = envSchema.parse(process.env);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';

import routes from "./routes/index.js";
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';
import connectDB from './config/db.js';

const app = express();

// ✅ Connect DB
connectDB();

// ✅ Middlewares
app.set('trust proxy', true);
app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? allowedOrigins
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('combined'));
app.use(globalRateLimit);

app.use(express.json({
    limit: BodyLimit,
}));

app.use(express.urlencoded({
    extended: true,
    limit: BodyLimit,
}));

app.use(xssClean());
app.use(mongoSanitize());

// ✅ REGISTER ROUTES (ONLY ONCE)
app.use("/", routes);
// ✅ Error handling
app.use(errorMiddleware);

// ✅ 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ✅ Server start
const port = Number(env.PORT) || 3001;

app.listen(port, () => {
    logger.info(`🚀 API Server running on http://localhost:${port}`);
});

// ✅ Process handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
    logger.info('Interrupted');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received');
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('Exiting');
    process.exit();
});

export default app;
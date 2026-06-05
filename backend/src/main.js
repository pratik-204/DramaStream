import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(helmet());
if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin(origin, callback) {
            if (allowedOrigins.length === 0) return callback(new Error('CORS origin not configured'));
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }));
} else {
    // Development: allow all origins to avoid CORS friction in local environment
    app.use(cors({ origin: true, credentials: true }));
}
app.use(morgan('combined'));
app.use(globalRateLimit);

app.use(express.json({
    limit: BodyLimit,
}));

app.use(express.urlencoded({
    extended: true,
    limit: BodyLimit,
}));

// ✅ REGISTER ROUTES (ONLY ONCE)
app.use("/", routes);
// ✅ Error handling
app.use(errorMiddleware);

// ✅ 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ✅ Server start
const port = process.env.PORT || 3001;

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
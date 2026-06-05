import logger from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
    logger.error('Error:', err.message);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: Object.values(err.errors).map(e => e.message),
        });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(409).json({
            error: 'Duplicate field value entered',
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
        });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
    });
};

const validator = (schema, source) => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        const error = result.error.flatten();
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: error,
        });
    }

    req[source] = result.data;
    next();
};

export const validateBody = (schema) => validator(schema, 'body');
export const validateQuery = (schema) => validator(schema, 'query');
export const validateParams = (schema) => validator(schema, 'params');

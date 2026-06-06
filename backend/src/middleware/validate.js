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

    switch (source) {
        case 'body':
            req.body = result.data;
            break;

        case 'params':
            req.params = result.data;
            break;

        case 'query':
            req.validatedQuery = result.data;
            break;

        default:
            req[source] = result.data;
    }

    next();
};

export const validateBody = (schema) => validator(schema, 'body');
export const validateQuery = (schema) => validator(schema, 'query');
export const validateParams = (schema) => validator(schema, 'params');

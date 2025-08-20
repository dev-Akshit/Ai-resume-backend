export const checkLoginStatus = (req, res, next) => {
    const isMiddleware = next && typeof next === 'function';
    if (isMiddleware) {
        if (!req.session?.userId) {
            return res.status(401).json({ error: 'Please login first' });
        }
        return next();
    }
    return !!req?.session?.userId;
}
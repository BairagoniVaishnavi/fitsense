/**
 * notFound — 404 handler for unmatched routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler — Central error handler.
 * Normalises Mongoose, JWT, and generic errors into a
 * consistent { success, message, stack? } response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message    = err.message || 'Internal Server Error';

  // ── Mongoose: bad ObjectId ──────────────────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message    = 'Resource not found — invalid ID format';
  }

  // ── Mongoose: duplicate key (e.g. unique email) ─────────────────────────
  if (err.code === 11000) {
    statusCode     = 400;
    const field    = Object.keys(err.keyValue || {})[0] || 'field';
    const value    = err.keyValue?.[field] || '';
    message        = `${capitalise(field)} '${value}' is already registered`;
  }

  // ── Mongoose: validation errors ─────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // ── JWT errors ──────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired — please log in again'; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = { notFound, errorHandler };

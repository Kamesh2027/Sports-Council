function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ message: error.message || 'Unexpected error.' });
}

module.exports = errorMiddleware;

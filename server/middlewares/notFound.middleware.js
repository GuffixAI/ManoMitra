export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
};

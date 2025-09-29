export const notFound = (_req, _res, next) => {
  const error = new Error("Resource not found");
  error.status = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || "Unexpected error",
  });
};

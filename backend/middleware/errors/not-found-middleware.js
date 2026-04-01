// backend/middleware/errors/not-found-middleware.js
export const notFoundMiddleware = (req, res, next) => {
  const errorDetails = {
    success: false,
    status: 404,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  // Respond differently based on expected content type
  if (req.accepts("html")) {
    res.status(404).send(
      `<h1>404 - Route Not Found</h1>
         <p><strong>Path:</strong> ${errorDetails.path}</p>
         <p><strong>Method:</strong> ${errorDetails.method}</p>
         <p><strong>Timestamp:</strong> ${errorDetails.timestamp}</p>`
    );
  } else {
    res.status(404).json(errorDetails);
  }
};

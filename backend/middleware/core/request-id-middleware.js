// middlewares/requestIdMiddleware.js

import { v4 as uuidv4 } from "uuid";

/**
 * Creates a middleware function that generates and attaches a request ID to each request.
 *
 * @param {string} [headerName="x-request-id"] - The name of the header to use for the request ID.
 * @returns {function} - The middleware function to generate and attach a request ID.
 */
export function createRequestIdMiddleware(headerName = "x-request-id") {
  return function requestIdMiddleware(req, res, next) {
    req.requestId = req.headers[headerName] || uuidv4();
    res.set(headerName, req.requestId);
    next();
  };
}

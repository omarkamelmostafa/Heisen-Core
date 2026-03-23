
/**
 * Handles API responses for both success and error conditions, with integrated logging.
 * Accepts parameters as an options object.
 *
 * @param {Object} req - The request object from Express.js
 * @param {Object} res - The response object from Express.js
 * @param {Object} options - The options object containing response parameters
 * @param {number} options.statusCode - The HTTP status code to return
 * @param {boolean} options.success - Indicates if the response is for a success or error
 * @param {string} options.message - A user-friendly message
 * @param {Object} [options.data] - The payload to send in case of success
 * @param {string} [options.errorDetails] - Additional details about the error, if any
 * @param {Object} [options.pagination] - Pagination data if applicable
 * @param {string} [options.errorCode] - A standardized error code (optional)
 * @param {string} [options.requestId] - A unique ID for tracking the request (optional)
 */

export const apiResponseManager = (
  req,
  res,
  {
    statusCode,
    success,
    message,
    data = null,
    errorDetails = null,
    pagination = null,
    errorCode = null,
    requestId = null,
  }
) => {
  if (res.headersSent) {
    console.warn("Response already sent, skipping apiResponseManager");
    return;
  }

  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString(),
    requestId: req?.requestId ? req?.requestId : requestId ? requestId : null,
  };

  if (data) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  if (errorDetails) {
    response.details = errorDetails;
  }

  if (errorCode) {
    response.errorCode = errorCode
      ? errorCode
      : res?.statusMessage
      ? res?.statusMessage
      : null;
  }

  // Send the response
  res.status(statusCode).json(response);
  return;
};

// Example Usage for Success Response with Pagination:
// return apiResponseManager(req, res, {
//   statusCode: 200,
//   success: true,
//   message: "Users retrieved successfully",
//   data: users,
//   pagination: {
//     currentPage: 2,
//     pageSize: 10,
//     totalItems: 100,
//     totalPages: 10,
//   },
// });

// Example Usage for Error Response Without Pagination:
// return apiResponseManager(req, res, {
//   statusCode: 500,
//   success: false,
//   message: 'Server error',
//   errorDetails: error.message,
//   errorCode: 'SERVER_ERROR'
// });

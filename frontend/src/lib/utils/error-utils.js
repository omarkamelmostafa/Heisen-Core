/**
 * Normalizes API and JavaScript errors into a consistent structure.
 * @param {Error|Object} error The error object to normalize.
 * @param {string} defaultMessage Fallback message if no other message is found.
 * @returns {Object} Normalized error object.
 */
export const normalizeError = (error, defaultMessage = "An unexpected error occurred") => {
  if (error && error.isNormalized) return error;

  return {
    message: error?.response?.data?.message || error?.message || defaultMessage,
    errorCode: error?.response?.data?.errorCode || null,
    code: error?.code,
    status: error?.response?.status || null,
    details: error?.response?.data?.details,
    isNormalized: true,
    isCancelled: error?.name === "CanceledError" || error?.code === "ERR_CANCELED",
    originalError: error,
  };
};

/**
 * Normalizes API responses into a consistent structure.
 * @param {Object} response Axios response object.
 * @returns {Object} Normalized response object.
 */
export const normalizeResponse = (response) => {
  return {
    data: response?.data,
    status: response?.status,
    headers: response?.headers,
    timestamp: Date.now(),
  };
};

// backend/middleware/core/api-version-middleware.js

/**
 * API Version middleware.
 * - Adds `X-API-Version` response header to every API response.
 * - Supports optional deprecation warnings via `X-API-Deprecated` header.
 *
 * @param {object} [options]
 * @param {string} [options.currentVersion='1'] - The current API version string.
 * @param {string[]} [options.deprecatedVersions=[]] - Versions considered deprecated.
 * @param {string} [options.sunsetDate] - ISO date when deprecated versions will be removed.
 */
export const createApiVersionMiddleware = (options = {}) => {
  const {
    currentVersion = "1",
    deprecatedVersions = [],
    sunsetDate = null,
  } = options;

  return (req, res, next) => {
    // Always include current API version in response
    res.setHeader("X-API-Version", currentVersion);

    // Detect requested version from URL path
    const versionMatch = req.path.match(/^\/api\/v(\d+)/);
    const requestedVersion = versionMatch ? versionMatch[1] : null;

    // If the requested version is deprecated, warn the client
    if (requestedVersion && deprecatedVersions.includes(requestedVersion)) {
      res.setHeader("X-API-Deprecated", "true");
      res.setHeader(
        "X-API-Deprecation-Notice",
        `API v${requestedVersion} is deprecated. Please migrate to v${currentVersion}.`
      );
      if (sunsetDate) {
        res.setHeader("Sunset", sunsetDate);
      }
    }

    next();
  };
};

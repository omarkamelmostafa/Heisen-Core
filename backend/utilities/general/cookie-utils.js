// cookieUtils.js

/**
 * Sets a specific cookie with the provided name, value, and options.
 * @param {Object} res - The response object from Express.js.
 * @param {string} cookieName - The name of the cookie to set.
 * @param {string} value - The value to set for the cookie.
 * @param {Object} options - Options for setting the cookie.
 */
export const setCookie = (res, cookieName, value, options = {}) => {
  try {
    // Default options
    const defaultOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Lax", // "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // Default to 24 hours
    };

    // domain: ".mydomain.com", // Set the cookie domain to ".mydomain.com" for a subdomain cookie
    // secure: true, // Set the cookie to only be sent over HTTPS
    // sameSite: "Strict", // Set the SameSite attribute to "Strict" to enforce strict SameSite cookies.
    // SameSite: "Lax", // Set the SameSite attribute to "Lax" to allow SameSite cookies in cross-origin requests.
    // SameSite: "None", // Set the SameSite attribute to "None" to allow SameSite cookies in cross-origin requests.

    // Merge default options with provided options
    const cookieOptions = { ...defaultOptions, ...options };

    res.cookie(cookieName, value, cookieOptions);

    // console.log(`Cookie '${cookieName}' set with value '${value}'.`);
  } catch (error) {
    console.error(`Could not set cookie '${cookieName}':`, error);
    throw error;
  }
};

/**
 * Clears a specific cookie by setting its expiry to a past date.
 * @param {Object} res - The response object from Express.js.
 * @param {string} cookieName - The name of the cookie to clear.
 */
export const clearCookie = (res, cookieName) => {
  try {
    const cookieExpiry = new Date(0); // Date in the past to expire the cookie

    res.cookie(cookieName, "", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax", // " "None",
      path: "/", // Set the cookie path to the root URL
      expires: cookieExpiry, // Set expiry to the past
      maxAge: 0,
    });

    console.log(`Cookie '${cookieName}' cleared.`);
  } catch (error) {
    console.error(`Could not clear cookie '${cookieName}':`, error);
    throw error;
  }
};

// bodyParserMiddleware.js
import bodyParser from "body-parser";

// Define options for bodyParser middleware
const bodyParserOptions = {
  // Limit the maximum request body size (in bytes)
  limit: "30mb", // Example: Limit to 10 megabytes
  // Enable extended mode for parsing URL-encoded data with qs library (richer parsing)
  // extended: true,
  // Enable strict mode for URL-encoded data parsing (true by default)
  strict: true,
  // Verify if JSON is malformed (true by default)
  strictJSON: true,
  // Inflate compressed bodies (false by default)
  inflate: true,
  // Type to parse (array or string) for URL-encoded data (string by default)
  type: "application/x-www-form-urlencoded",
  // Verify if data is UTF-8 encoded (true by default)
  verify: undefined,
  // Limit the size of the key-value pairs (in bytes)
  parameterLimit: 1000, // Example: Limit to 1000 key-value pairs
};

export const bodyParserMiddleware = [
  bodyParser.json({ limit: "30mb" }),
  bodyParser.urlencoded({ ...bodyParserOptions, extended: true }),
];

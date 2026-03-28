// frontend/src/lib/i18n/api-error-translator.js

import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";
import { validationMessages } from "./validation-messages";

const apiErrorMaps = {
  en: enMessages.apiErrors || {},
  ar: arMessages.apiErrors || {},
};

const interceptorMaps = {
  en: enMessages.interceptor || {},
  ar: arMessages.interceptor || {},
};

/**
 * Gets current locale from NEXT_LOCALE cookie.
 * @returns {"en" | "ar"}
 */
function getCurrentLocale() {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/NEXT_LOCALE=(en|ar)/);
  return match ? match[1] : "en";
}

/**
 * Normalizes a message string for lookup:
 * strips trailing period/punctuation, trims whitespace.
 */
function normalizeForLookup(msg) {
  if (!msg) return "";
  return msg.trim().replace(/[.!]+$/, "").trim();
}

/**
 * Looks up a raw backend validation message in the validation map.
 * Tries exact match first, then normalized (no trailing period).
 * 
 * @param {string} rawMessage - The exact message from backend
 * @param {string} locale - "en" or "ar"
 * @returns {string|null} Translated message or null if not found
 */
function lookupValidationMessage(rawMessage, locale) {
  const map = validationMessages[locale] || validationMessages.en;

  // Exact match
  if (map[rawMessage]) return map[rawMessage];

  // Normalized match (strip trailing punctuation)
  const normalized = normalizeForLookup(rawMessage);
  if (map[normalized]) return map[normalized];

  // Try matching against normalized keys
  for (const [key, value] of Object.entries(map)) {
    if (normalizeForLookup(key) === normalized) return value;
  }

  return null;
}

/**
 * Translates a backend error message using errorCode + raw message.
 * 
 * Priority:
 * 1. "BadRequest" errorCode → parse "Validation failed: X" and translate X
 * 2. Exact errorCode match in apiErrors
 * 3. Raw message lookup in validation messages
 * 4. Fallback to raw English message
 *
 * @param {string} errorCode - Backend errorCode field
 * @param {string} fallbackMessage - Raw English message from backend (used if no translation)
 * @returns {string} Translated user-facing message
 */
export function translateApiError(errorCode, fallbackMessage = "") {
  const locale = getCurrentLocale();
  const apiMap = apiErrorMaps[locale] || apiErrorMaps.en;

  // 1. Handle "BadRequest" from validation middleware
  //    Message format: "Validation failed: [specific validation message]"
  if (errorCode === "BadRequest" && fallbackMessage) {
    const prefix = "Validation failed: ";
    if (fallbackMessage.startsWith(prefix)) {
      const specificMsg = fallbackMessage.slice(prefix.length);
      const translated = lookupValidationMessage(specificMsg, locale);
      if (translated) {
        const translatedPrefix = locale === "ar" ? "فشل التحقق: " : "Validation failed: ";
        return translatedPrefix + translated;
      }
    }
    // If no specific match, try the full message as a validation lookup
    const fullLookup = lookupValidationMessage(fallbackMessage, locale);
    if (fullLookup) return fullLookup;

    // Fall through to apiErrors map for generic "BadRequest"
  }

  // 2. Exact errorCode match in apiErrors
  if (errorCode && apiMap[errorCode]) {
    return apiMap[errorCode];
  }

  // 3. Try raw message as validation message lookup
  if (fallbackMessage) {
    const validationLookup = lookupValidationMessage(fallbackMessage, locale);
    if (validationLookup) return validationLookup;
  }

  // 4. Fall back to raw English message
  return fallbackMessage || apiMap["INTERNAL_ERROR"] || "An error occurred";
}

/**
 * Translates interceptor toast strings.
 * Works outside React — reads locale from cookie.
 *
 * @param {string} key - Translation key (e.g., "sessionExpired")
 * @param {object} params - Interpolation params (e.g., { minutes: 5 })
 * @returns {string} Translated string
 */
export function translateInterceptor(key, params = {}) {
  const locale = getCurrentLocale();
  const map = interceptorMaps[locale] || interceptorMaps.en;

  let message = map[key] || key;

  Object.entries(params).forEach(([param, value]) => {
    message = message.replace(new RegExp(`\\{${param}\\}`, "g"), String(value));
  });

  return message;
}

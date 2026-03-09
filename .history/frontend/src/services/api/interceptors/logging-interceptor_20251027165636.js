// frontend/src/services/api/interceptors/logging-interceptor.js

/**
 * Enterprise Logging Interceptor
 * Comprehensive request/response logging for monitoring, debugging, and analytics
 */

class LoggingInterceptor {
  constructor() {
    this.enabled = process.env.NODE_ENV !== "production";
    this.logLevel = process.env.NODE_ENV === "development" ? "debug" : "info";
    this.sensitiveFields = ["password", "token", "authorization", "secret"];
  }

  // ==================== REQUEST LOGGING ====================

  logRequest(config) {
    if (!this.enabled) return;

    const logData = {
      type: "REQUEST",
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      timestamp: new Date().toISOString(),
      headers: this.sanitizeHeaders(config.headers),
      params: config.params,
      data: this.sanitizeData(config.data),
    };

    this.writeLog("info", "API Request", logData);
  }

  // ==================== RESPONSE LOGGING ====================

  logResponse(response) {
    if (!this.enabled) return;

    const duration =
      Date.now() - (response.config.metadata?.startTime || Date.now());

    const logData = {
      type: "RESPONSE",
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      data: this.sanitizeData(response.data),
    };

    const logLevel = response.status >= 400 ? "warn" : "info";
    this.writeLog(logLevel, "API Response", logData);
  }

  // ==================== ERROR LOGGING ====================

  logError(error) {
    const duration =
      Date.now() - (error.config?.metadata?.startTime || Date.now());

    const logData = {
      type: "ERROR",
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };

    this.writeLog("error", "API Error", logData);
  }

  // ==================== PERFORMANCE LOGGING ====================

  logPerformance(metric) {
    const logData = {
      type: "PERFORMANCE",
      metric: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: new Date().toISOString(),
      context: metric.context,
    };

    this.writeLog("debug", "Performance Metric", logData);
  }

  // ==================== SECURITY & SANITIZATION ====================

  sanitizeHeaders(headers) {
    if (!headers) return {};

    const sanitized = { ...headers };
    this.sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***REDACTED***";
      }
      if (sanitized[field.toLowerCase()]) {
        sanitized[field.toLowerCase()] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  sanitizeData(data) {
    if (!data || typeof data !== "object") return data;

    const sanitized = JSON.parse(JSON.stringify(data));
    this.redactSensitiveFields(sanitized);
    return sanitized;
  }

  redactSensitiveFields(obj) {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj).forEach((key) => {
      const lowerKey = key.toLowerCase();

      // Check if this field contains sensitive data
      if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
        obj[key] = "***REDACTED***";
      } else if (typeof obj[key] === "object") {
        this.redactSensitiveFields(obj[key]);
      }
    });
  }

  // ==================== LOG WRITING ====================

  writeLog(level, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...data,
    };

    // Console logging (development)
    if (this.enabled) {
      const consoleMethod = console[level] || console.log;
      const style = this.getLogStyle(level);

      console.groupCollapsed(
        `%c${level.toUpperCase()}%c: ${message}`,
        style,
        ""
      );
      console.log("Details:", logEntry);
      console.groupEnd();
    }

    // TODO: Integrate with your logging service (Sentry, LogRocket, etc.)
    this.sendToLogService(logEntry);
  }

  getLogStyle(level) {
    const styles = {
      error:
        "background: #fef2f2; color: #dc2626; padding: 2px 6px; border-radius: 3px;",
      warn: "background: #fffbeb; color: #d97706; padding: 2px 6px; border-radius: 3px;",
      info: "background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 3px;",
      debug:
        "background: #f9fafb; color: #6b7280; padding: 2px 6px; border-radius: 3px;",
    };

    return styles[level] || styles.info;
  }

  sendToLogService(logEntry) {
    // Integration with external logging services
    if (typeof window !== "undefined") {
      // Example: Send to analytics service
      // analytics.track('api_request', logEntry);

      // Example: Send to error monitoring
      if (logEntry.level === "ERROR" && window.Sentry) {
        // window.Sentry.captureException(new Error(logEntry.message), { extra: logEntry });
      }
    }
  }

  // ==================== INTERCEPTOR SETUP ====================

  setupRequestInterceptor(axiosInstance) {
    return axiosInstance.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        this.logRequest(config);
        return config;
      },
      (error) => {
        this.logError(error);
        return Promise.reject(error);
      }
    );
  }

  setupResponseInterceptor(axiosInstance) {
    return axiosInstance.interceptors.response.use(
      (response) => {
        this.logResponse(response);
        this.logPerformance({
          name: "api_response_time",
          value: Date.now() - response.config.metadata.startTime,
          unit: "ms",
          context: { url: response.config.url, method: response.config.method },
        });
        return response;
      },
      (error) => {
        this.logError(error);
        return Promise.reject(error);
      }
    );
  }

  // ==================== CONFIGURATION ====================

  enableLogging() {
    this.enabled = true;
  }

  disableLogging() {
    this.enabled = false;
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  addSensitiveField(field) {
    if (!this.sensitiveFields.includes(field)) {
      this.sensitiveFields.push(field);
    }
  }
}

// Singleton instance
export const loggingInterceptor = new LoggingInterceptor();
export default loggingInterceptor;

// backend/__tests__/unit/emit-log.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { emitLogMessage } from "../../utilities/general/emit-log.js";
import logger from "../../utilities/general/logger.js";

// Mock logger
vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("emitLogMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("Logger integration", () => {
    it("should log to pino logger at info level for 'info' messages", () => {
      emitLogMessage("Test info message", "info");

      expect(logger.info).toHaveBeenCalledWith(
        { source: "emitLogMessage", success: false },
        "Test info message"
      );
    });

    it("should log to pino logger at info level for 'success' messages", () => {
      emitLogMessage("Test success message", "success");

      expect(logger.info).toHaveBeenCalledWith(
        { source: "emitLogMessage", success: true },
        "Test success message"
      );
    });

    it("should log to pino logger at error level for 'error' messages", () => {
      emitLogMessage("Test error message", "error");

      expect(logger.error).toHaveBeenCalledWith(
        { source: "emitLogMessage", success: false },
        "Test error message"
      );
    });
  });

  describe("Console output", () => {
    it("should output to console.log", () => {
      emitLogMessage("Console message", "info");

      expect(console.log).toHaveBeenCalled();
    });

    it("should include message text in console output", () => {
      emitLogMessage("Find me in output", "info");

      const consoleArg = console.log.mock.calls[0][0];
      expect(consoleArg).toContain("Find me in output");
    });

    it("should include level label in console output", () => {
      emitLogMessage("Some message", "error");

      const consoleArg = console.log.mock.calls[0][0];
      expect(consoleArg).toContain("ERROR");
    });
  });

  describe("Default parameters", () => {
    it("should default to 'info' level when none specified", () => {
      emitLogMessage("Default level message");

      expect(logger.info).toHaveBeenCalled();
    });

    it("should include timestamp by default", () => {
      emitLogMessage("Timestamped message", "info");

      const consoleArg = console.log.mock.calls[0][0];
      // Timestamp format: [HH:MM:SS AM/PM]
      expect(consoleArg).toMatch(/\[.*\]/);
    });

    it("should omit timestamp when includeTimestamp is false", () => {
      emitLogMessage("No timestamp", "info", {}, false);

      const consoleArg = console.log.mock.calls[0][0];
      // Should still contain the message
      expect(consoleArg).toContain("No timestamp");
    });
  });

  describe("Invalid log levels", () => {
    it("should warn and default to 'info' for invalid levels", () => {
      emitLogMessage("Bad level", "debug");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid log level: "debug"')
      );
      // Should still call console.log with the message
      expect(console.log).toHaveBeenCalled();
    });
  });
});

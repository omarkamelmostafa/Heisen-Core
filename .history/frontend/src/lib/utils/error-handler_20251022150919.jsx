// lib/utils/error-handler - Production-grade error filtering
export class ExtensionErrorHandler {
  static init() {
    if (typeof window === "undefined") return;

    if (process.env.NODE_ENV === "development") {
      this.suppressExtensionErrors();
    }
  }

  static suppressExtensionErrors() {
    const originalError = console.error;

    console.error = (...args) => {
      // Filter out common extension errors
      const shouldSuppress = args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes(
            "The message port closed before a response was received"
          ) ||
            arg.includes("Extension context invalidated") ||
            arg.includes("Could not establish connection"))
      );

      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Also catch unhandled promise rejections from extensions
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("message port closed")) {
        event.preventDefault();
      }
    });
  }
}

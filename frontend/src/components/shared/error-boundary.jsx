"use client";

import React from "react";
import ErrorFallback from "./error-fallback";

/**
 * Standard React Class-based Error Boundary
 * Catches rendering errors in the underlying component tree.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          reset={this.handleReset}
          title={this.props.title}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

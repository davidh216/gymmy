// src/components/ErrorBoundary.js
// React Native compatible Error Boundary

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use the FallbackComponent prop if provided, otherwise use default
      if (this.props.FallbackComponent) {
        return (
          <this.props.FallbackComponent 
            error={this.state.error}
            resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          />
        );
      }

      // Default fallback UI
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
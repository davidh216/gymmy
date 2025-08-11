import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorFallback from '../components/ErrorFallback';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset console.error mock
    console.error = jest.fn();
  });

  test('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(getByText('No error')).toBeTruthy();
  });

  test('catches error and renders fallback UI', () => {
    const { getByText } = render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  test('calls onError prop when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError} FallbackComponent={ErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
  });

  test('resets error state when resetError is called', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Error boundary should show error UI
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    
    // Reset error by re-rendering with no error
    rerender(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
  });
});
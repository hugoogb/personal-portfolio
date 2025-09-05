import type { ReactNode, ErrorInfo } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Component error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px'
        }}>
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ 
              padding: '0.5rem 1rem', 
              marginTop: '1rem',
              cursor: 'pointer',
              backgroundColor: '#3142db',
              color: '#fff',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 
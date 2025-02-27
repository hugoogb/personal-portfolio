import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
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
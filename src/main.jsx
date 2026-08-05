import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#ffffff', color: '#dc2626', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Application Error Encountered</h2>
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '15px' }}>The component tree crashed with the following traceback:</p>
          <pre style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fca5a5', overflow: 'auto', fontSize: '13px', color: '#991b1b' }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

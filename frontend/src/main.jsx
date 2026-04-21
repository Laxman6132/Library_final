import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'
import React from 'react'

/* ── Error Boundary: shows the real error instead of a white screen ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '2rem', fontFamily: 'monospace', background: '#1a0000',
          color: '#ff6b6b', minHeight: '100vh', whiteSpace: 'pre-wrap', fontSize: '0.85rem'
        }}>
          <h2 style={{ color: '#ff4444' }}>⚠ Application Error</h2>
          <p style={{ color: '#ffa0a0' }}>
            Please open DevTools (F12) → Console for more details, or report this error:
          </p>
          <div style={{ background: '#2d0000', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
            <strong>{this.state.error.toString()}</strong>
            {'\n\n'}
            {this.state.error.stack}
          </div>
          <button
            style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', borderRadius: 8, background: '#ff4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => { this.setState({ error: null }); window.location.href = '/login'; }}
          >
            Go to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Remove StrictMode — it double-invokes effects which breaks html5-qrcode camera scanner
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)

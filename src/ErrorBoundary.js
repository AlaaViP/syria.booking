import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error('App crash:', error, info); }
  render(){
    if (this.state.hasError){
      return (
        <div style={{padding:24, fontFamily:'Cairo, sans-serif'}}>
          <h2>⚠ حدث خطأ في الواجهة</h2>
          <pre style={{whiteSpace:'pre-wrap', background:'#f7f7f7', padding:12, borderRadius:8}}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

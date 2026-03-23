'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.label ?? 'unknown'}]`, error);
  }

  reset = () => this.setState({ hasError: false });

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: '#fef2f2', border: '1px solid #fca5a5',
          fontSize: 12, color: '#dc2626',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span>{this.props.label ? `${this.props.label} failed to load.` : 'Something went wrong.'}</span>
          <button
            onClick={this.reset}
            style={{
              padding: '3px 10px', borderRadius: 6, border: 'none',
              background: '#dc2626', color: 'white', fontSize: 11,
              fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function SkeletonBlock({ height = 60, radius = 8 }: { height?: number; radius?: number }) {
  return (
    <div style={{
      height, borderRadius: radius,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s infinite',
    }} />
  );
}

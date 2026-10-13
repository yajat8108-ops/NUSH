'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Canvas encountered an error, falling back gracefully:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full p-8 rounded-3xl bg-zinc-950/80 border border-white/10 text-center font-nunito my-6">
          <span className="text-3xl">🌌</span>
          <p className="text-white font-bold text-sm mt-2">3D Celestial View Paused</p>
          <p className="text-xs text-zinc-400 mt-1">
            Your device or browser switched to power-saving mode. The rest of our universe is active! ✨
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

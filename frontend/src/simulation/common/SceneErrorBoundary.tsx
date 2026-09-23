import React from 'react';

export interface SceneErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface SceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SceneErrorBoundary extends React.Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn('[SceneErrorBoundary] 3D Asset fallback activated:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export default SceneErrorBoundary;

import { Component, type ReactNode } from "react";

export class EffectsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Effects disabled:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

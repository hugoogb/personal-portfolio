import { Component, type ReactNode } from "react";

/**
 * Effects are a finish, not the town: if the composer cannot start (an old
 * driver, missing float targets, a failed chunk), render without them.
 */
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

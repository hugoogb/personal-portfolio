import { Component, type ReactNode } from "react";

/**
 * Effects are a finish, not the town: if the chunk fails to load or the
 * composer throws while mounting, render without them. Draw-time GPU errors
 * are not caught here; the capability gate keeps the known one (no float
 * targets) from ever mounting the composer.
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

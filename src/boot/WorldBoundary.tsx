import { Component, type ReactNode } from "react";

interface Props {
  onError: () => void;
  children: ReactNode;
}

/**
 * Any render error from the HUD or the canvas (a WebGL context that cannot be
 * created, a scene that throws) would unmount the whole app and leave the title
 * card up. This hands the visitor to the Brief instead.
 */
export class WorldBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

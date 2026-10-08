import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without globals, so Testing Library cannot register its own
// cleanup; unmount every rendered tree and drop saved state between tests.
afterEach(() => {
  cleanup();
  if (typeof localStorage !== "undefined") localStorage.clear();
});

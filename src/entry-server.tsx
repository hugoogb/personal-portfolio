import { StrictMode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { App } from "@/App";

export { structuredData } from "@/utils/structuredData";

/**
 * Renders the whole page to HTML at build time (see scripts/prerender.mjs).
 *
 * renderToString would not do: About, Work and Contact are lazy, and it emits
 * the Suspense fallback for anything not loaded yet - the spinner, not the
 * sections. The stream waits for every boundary when `onAllReady` fires.
 */
export const render = () =>
  new Promise<string>((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk.toString();
        done();
      },
      final(done) {
        resolve(html);
        done();
      },
    });

    const stream = renderToPipeableStream(
      <StrictMode>
        <App />
      </StrictMode>,
      {
        onAllReady: () => stream.pipe(sink),
        onShellError: reject,
        // A render error inside a boundary would otherwise ship its fallback
        // silently - fail the build instead.
        onError: reject,
      },
    );
  });

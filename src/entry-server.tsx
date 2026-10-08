import { StrictMode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { Brief } from "@/brief/Brief";
import { TitleCard } from "@/brief/TitleCard";

export { structuredData } from "@/utils/structuredData";

/**
 * Renders the whole page to HTML at build time (see scripts/prerender.mjs).
 *
 * The stream waits for every Suspense boundary when `onAllReady` fires, so the
 * page stays complete if a later phase makes part of it lazy.
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
        <TitleCard />
        <Brief />
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

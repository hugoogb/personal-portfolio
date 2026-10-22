import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { Story } from "@/story/Story";

export { structuredData } from "@/utils/structuredData";

/** Renders the whole page to HTML at build time (see scripts/prerender.mjs). */
export const render = async () => {
  // A render error inside a boundary would otherwise ship its fallback silently: fail the build.
  let failure: unknown;
  const { prelude } = await prerender(
    <StrictMode>
      <Story />
    </StrictMode>,
    { onError: (error) => void (failure ??= error) },
  );
  if (failure) throw failure;
  return new Response(prelude).text();
};

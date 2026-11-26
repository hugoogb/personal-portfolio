import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { Story } from "@/story/Story";

export { structuredData } from "@/utils/structuredData";

export const render = async () => {
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

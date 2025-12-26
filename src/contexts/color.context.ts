import { createContext } from "react";
import type { ColorContextValue } from "@/types/common.types";
import { DEFAULT_COLOR } from "@/constants/colors.constants";

export const ColorContext = createContext<ColorContextValue>({
  color: DEFAULT_COLOR,
  setColor: () => { },
});

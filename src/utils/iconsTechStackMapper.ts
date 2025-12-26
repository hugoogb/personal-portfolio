import { IconError404 } from "@tabler/icons-react";
import type { TechIcon } from "@/constants/icons.constants";

export const mapTechStackToIcons = (techArray: string[], iconsArray: TechIcon[]): TechIcon[] => {
  return techArray.map((tech) => {
    const icon = iconsArray.find((icon) => icon.name.toLowerCase() === tech.toLowerCase());
    return icon
      ? { ...icon }
      : {
          id: -1,
          icon: IconError404,
          name: tech,
        };
  });
};

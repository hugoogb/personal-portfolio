import { IconError404 } from "@tabler/icons-react";
import type { TechIcon } from "@/constants/icons.constants";
import type { TechId } from "@/constants/icons.constants";

export const mapTechStackToIcons = (techArray: TechId[], iconsArray: TechIcon[]): TechIcon[] => {
  return techArray.map((techId) => {
    const icon = iconsArray.find((icon) => icon.name === techId);
    return icon ?? { id: -1, icon: IconError404, name: techId };
  });
};

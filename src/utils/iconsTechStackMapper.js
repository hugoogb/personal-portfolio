import { IconError404 } from "@tabler/icons-react";

export const mapTechStackToIcons = (techArray, iconsArray) => {
  return techArray.map((tech) => {
    const icon = iconsArray.find(
      (icon) => icon.name.toLowerCase() === tech.toLowerCase()
    );
    return icon ? { ...icon } : { icon: IconError404, name: tech };
  });
};

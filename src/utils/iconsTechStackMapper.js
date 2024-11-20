export const mapTechStackToIcons = (techArray, iconsArray) => {
  return techArray.map((tech) => {
    const icon = iconsArray.find(
      (icon) => icon.alt.toLowerCase() === tech.toLowerCase()
    );
    return icon ? { ...icon, name: tech } : { src: "", alt: tech, name: tech };
  });
};

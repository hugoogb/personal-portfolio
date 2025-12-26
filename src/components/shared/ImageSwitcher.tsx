import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { ALT_TEXT } from "@/constants/strings.constants";
import { motion, AnimatePresence } from "motion/react";

interface ImageSwitcherProps {
  images: readonly string[];
  backgroundColor: string;
  altText?: string;
}

export const ImageSwitcher: FC<ImageSwitcherProps> = ({
  images,
  backgroundColor,
  altText = ALT_TEXT.PROFILE,
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);

  const toggleImage = useCallback(() => {
    setActiveImage((prev) => (prev === 0 ? 1 : 0));
  }, []);

  // Warm the browser cache for faster switching / fewer janks.
  const otherImage = useMemo(() => images[activeImage === 0 ? 1 : 0], [images, activeImage]);
  useEffect(() => {
    if (!otherImage) return;
    const img = new Image();
    img.src = otherImage;
  }, [otherImage]);

  return (
    <div
      style={{ backgroundColor: backgroundColor }}
      className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={activeImage}
          src={images[activeImage]}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          loading="eager"
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>

      <motion.button
        onClick={toggleImage}
        className="absolute bottom-4 right-4 p-3 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg z-10 text-text cursor-pointer"
        aria-label="Switch profile image"
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9, rotate: -15 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: activeImage * 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <IconRefresh size={20} stroke={2} className="text-primary" />
        </motion.div>
      </motion.button>
    </div>
  );
};

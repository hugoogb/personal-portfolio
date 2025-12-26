import { useContext } from "react";
import { ColorContext } from "@/contexts/color.context";
import { HomeTitle } from "@/components/sections/home/HomeTitle";
import { ImageSwitcher } from "@/components/shared/ImageSwitcher";
import { motion } from "motion/react";
import naturalMemoji from "@/assets/memojis/natural.png";
import mentalboomMemoji from "@/assets/memojis/mentalboom.png";

const MEMOJIS = [naturalMemoji, mentalboomMemoji] as const;

export function HomeSection() {
  const { color } = useContext(ColorContext);

  return (
    <section
      id="Home"
      className="section-container min-h-dvh flex flex-col justify-center py-20 sm:py-28 snap-start snap-always"
    >
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 sm:gap-16 lg:gap-24">
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HomeTitle />
        </motion.div>
        <motion.div
          className="flex-1 flex justify-center md:justify-end shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <ImageSwitcher images={MEMOJIS} backgroundColor={color} />
        </motion.div>
      </div>
    </section>
  );
}

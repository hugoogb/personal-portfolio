import { HomeTitle } from "@/components/sections/home/HomeTitle";
import { ServicePanel } from "@/components/sections/home/ServicePanel";
import { motion } from "motion/react";

export function HomeSection() {
  return (
    <section
      id="Home"
      className="section-container min-h-dvh flex flex-col justify-center py-20 sm:py-28 snap-start snap-always"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 sm:gap-16 lg:gap-20">
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HomeTitle />
        </motion.div>
        <div className="w-full md:w-auto md:flex-1 flex justify-center md:justify-end">
          <ServicePanel />
        </div>
      </div>
    </section>
  );
}

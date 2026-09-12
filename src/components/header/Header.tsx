import { Navbar } from "@/components/header/navbar/Navbar";
import { motion, useScroll } from "motion/react";

export const Header = () => {
  // The page scrolls freely now rather than one section per gesture, so how far
  // through it you are is no longer implied by the nav pill.
  const { scrollYProgress } = useScroll();

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] pointer-events-none"
        style={{ scaleX: scrollYProgress, backgroundColor: "var(--primary-color)" }}
        aria-hidden="true"
      />

      <header className="fixed top-0 w-full z-50 py-4">
        <div className="max-w-fit mx-auto px-4">
          <div className="bg-background/80 backdrop-blur-md border border-border rounded-full shadow-sm">
            <div className="px-4 py-1">
              <Navbar />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

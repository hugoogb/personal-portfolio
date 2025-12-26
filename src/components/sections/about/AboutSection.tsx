import { useContext } from "react";
import { ColorContext } from "@/contexts/color.context";
import { AboutIcons } from "@/components/sections/about/AboutIcons";
import { SectionCard } from "@/components/sections/SectionCard";
import { BACKEND_ICONS, FRONTEND_ICONS, TOOLS_ICONS } from "../../../constants/icons.constants";
import { motion } from "motion/react";

export function AboutSection() {
  const { color } = useContext(ColorContext);

  const mapIcons = (icons: typeof FRONTEND_ICONS) => {
    return icons.map((icon) => (
      <motion.div
        key={icon.id}
        title={icon.name}
        className="p-2.5 sm:p-3 rounded-xl bg-muted/5 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
      >
        <icon.icon
          stroke={1.5}
          size={22}
          className="text-text group-hover:text-primary transition-colors duration-200 sm:w-6 sm:h-6"
        />
      </motion.div>
    ));
  };

  const iconsFrontendMapped = mapIcons(FRONTEND_ICONS);
  const iconsBackendMapped = mapIcons(BACKEND_ICONS);
  const iconsToolsMapped = mapIcons(TOOLS_ICONS);

  return (
    <SectionCard title="About" id="About">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-start">
        <motion.div
          className="space-y-6 sm:space-y-8 text-base sm:text-lg lg:text-xl text-muted leading-relaxed"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p>
            Hi! My name is{" "}
            <span style={{ color: color }} className="font-bold text-text">
              Hugo
            </span>
            . I'm a full stack developer with professional experience building end-to-end web
            applications. I specialize in Node.js backends and modern frontend frameworks like
            React, Next.js, and Angular.
          </p>
          <p>
            I consider myself highly resolutive and enjoy tackling complex problems with creative
            solutions. I work across the entire stack, from database design to user interfaces,
            always finding efficient ways to deliver results.
          </p>
          <p>
            If you're looking for someone who can build complete applications from start to finish,
            I'd love to work with you and help take your project to the next level.
          </p>
        </motion.div>
        <motion.div
          className="space-y-10 sm:space-y-12"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AboutIcons title="Frontend" iconsMapped={iconsFrontendMapped} color={color} />
          <AboutIcons title="Backend" iconsMapped={iconsBackendMapped} color={color} />
          <AboutIcons title="Tools" iconsMapped={iconsToolsMapped} color={color} />
        </motion.div>
      </div>
    </SectionCard>
  );
}

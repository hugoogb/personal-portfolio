import { AboutIcons } from "@/components/sections/about/AboutIcons";
import { SectionCard } from "@/components/sections/SectionCard";
import { TECH_GROUPS } from "@/constants/icons.constants";
import { motion } from "motion/react";

export function AboutSection() {
  return (
    <SectionCard title="About" id="About">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-16 items-start">
        <motion.div
          className="space-y-6 sm:space-y-7"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Hi, I'm <span className="font-display font-extrabold text-primary-display">Hugo</span>,
            a full-stack engineer based in Barcelona. I build web applications the whole way through
            - the data model, the API, and the interface people actually use - mostly in TypeScript
            and Node.js, with React, Next.js and NestJS.
          </p>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            The last couple of years have been SaaS work - features across existing platforms, and a
            greenfield internal control panel I'm on now. On my own time I run side projects on a
            VPS I manage myself: Docker, Postgres, a reverse proxy, deploys from CI. Writing the
            code and keeping it running are different skills and I wanted both.
          </p>

          <div className="flex flex-wrap gap-6 sm:gap-8 pt-1">
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-text">
                Barcelona
              </span>
              <span className="text-xs font-semibold text-muted/70">based, working remotely</span>
            </div>
            <div className="w-px bg-border" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-text">
                EU &amp; US hours
              </span>
              <span className="text-xs font-semibold text-muted/70">overlap I work across</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h3 className="font-display text-[15px] font-extrabold tracking-tight text-text">
            Stack
          </h3>
          {TECH_GROUPS.map((group) => (
            <AboutIcons key={group.label} title={group.label} icons={group.icons} />
          ))}
        </motion.div>
      </div>
    </SectionCard>
  );
}

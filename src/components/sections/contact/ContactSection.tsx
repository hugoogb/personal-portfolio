import { SectionCard } from "@/components/sections/SectionCard";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconCheck,
  IconCopy,
  IconMail,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import type { FC } from "react";
import { useState } from "react";

const EMAIL = "hugogaben8.02@gmail.com";

const LINKS = [
  {
    id: "github",
    icon: IconBrandGithub,
    handle: "github.com/hugoogb",
    meta: "Code, including this site",
    href: "https://github.com/hugoogb",
  },
  {
    id: "linkedin",
    icon: IconBrandLinkedin,
    handle: "linkedin.com/in/hugoogb",
    meta: "The longer version",
    href: "https://www.linkedin.com/in/hugoogb/",
  },
] as const;

export const ContactSection: FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionCard id="Contact" title="Get in touch">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-16 items-center">
        <motion.div
          className="space-y-7"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-text">
            Got something
            <br />
            that needs shipping?
          </h3>
          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-prose">
            I'm open to remote roles and freelance projects, and I work across EU and US hours.
            Email is the fastest way to reach me - I read everything and I answer.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-primary-fg text-sm sm:text-base font-bold hover:opacity-90 transition-opacity"
          >
            <IconMail size={20} stroke={1.8} />
            Email me
          </a>
        </motion.div>

        <motion.div
          className="w-full bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h3 className="font-display text-[15px] font-extrabold tracking-tight text-text px-6 pt-5 pb-4">
            Where to find me
          </h3>

          <div className="flex items-center gap-3.5 px-6 py-4 border-t border-border/60">
            <IconMail size={19} stroke={1.7} className="text-text shrink-0" aria-hidden="true" />
            <span className="flex flex-col gap-0.5 min-w-0 flex-grow">
              <span className="font-mono text-xs sm:text-[13px] text-text truncate">{EMAIL}</span>
              <span className="text-[11px] sm:text-xs font-medium text-muted/80">Email</span>
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="shrink-0 p-2 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
              aria-label={copied ? "Email address copied" : "Copy email address"}
            >
              {copied ? (
                <IconCheck size={16} className="text-green-500" />
              ) : (
                <IconCopy size={16} className="text-muted" />
              )}
            </button>
          </div>

          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 px-6 py-4 border-t border-border/60 hover:bg-muted/5 transition-colors"
            >
              <link.icon size={19} stroke={1.7} className="text-text shrink-0" aria-hidden="true" />
              <span className="flex flex-col gap-0.5 min-w-0 flex-grow">
                <span className="font-mono text-xs sm:text-[13px] text-text truncate">
                  {link.handle}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-muted/80">
                  {link.meta}
                </span>
              </span>
            </a>
          ))}
        </motion.div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-12 sm:pt-16 mt-12 border-t border-border/60">
        <span className="text-xs font-semibold text-muted/50">
          © {new Date().getFullYear()} Hugo García Benjumea
        </span>
        <span className="font-mono text-[11px] text-muted/40">
          built from barcelona, working remotely
        </span>
      </footer>
    </SectionCard>
  );
};

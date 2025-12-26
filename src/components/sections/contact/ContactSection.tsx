import { FC, useState } from "react";
import { SectionCard } from "@/components/sections/SectionCard";
import { motion } from "motion/react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { ExternalLinkButton } from "@/components/shared/ExternalLinkButton";

export const ContactSection: FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "hugogaben8.02@gmail.com";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    {
      id: 0,
      name: "GitHub",
      icon: IconBrandGithub,
      link: "https://github.com/hugoogb",
    },
    {
      id: 1,
      name: "LinkedIn",
      icon: IconBrandLinkedin,
      link: "https://www.linkedin.com/in/hugoogb/",
    },
  ];

  return (
    <SectionCard id="Contact" title="Get in Touch">
      <div className="flex flex-col items-center justify-center space-y-10 sm:space-y-16 text-center max-w-4xl mx-auto">
        <motion.div
          className="space-y-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-lg sm:text-xl lg:text-2xl text-muted leading-relaxed font-medium">
            I'm always looking for new opportunities and my inbox is always open. Whether you have a
            question or just want to say hi, I'll try my best to get back to you!
          </p>
        </motion.div>

        <motion.div
          className="w-full max-w-2xl px-4 flex flex-col items-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative group w-full sm:w-auto">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 sm:gap-6 px-6 sm:px-10 py-5 sm:py-8 bg-card border border-border rounded-4xl sm:rounded-[2.5rem] hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl group overflow-hidden"
            >
              <div className="p-3.5 sm:p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500 shrink-0">
                <IconMail size={28} className="sm:w-10 sm:h-10" stroke={1.5} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted/60 mb-0.5">
                  Email me at
                </p>
                <p className="text-base sm:text-2xl lg:text-3xl font-black text-text truncate">
                  {email}
                </p>
              </div>
            </a>

            <button
              onClick={copyToClipboard}
              className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 p-2.5 sm:p-3.5 bg-background border border-border rounded-2xl shadow-xl hover:border-primary transition-all duration-300 z-10 active:scale-90"
              title="Copy email"
            >
              {copied ? (
                <IconCheck size={18} className="sm:w-6 sm:h-6 text-green-500" />
              ) : (
                <IconCopy
                  size={18}
                  className="sm:w-6 sm:h-6 text-muted group-hover:text-primary transition-colors"
                />
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {socials.map((social) => (
            <ExternalLinkButton
              key={social.id}
              text={social.name}
              link={social.link}
              icon={social.icon}
            />
          ))}
        </motion.div>

        <motion.div
          className="pt-10 sm:pt-16 text-muted/30 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          © {new Date().getFullYear()} Hugo García Benjumea • Designed for impact
        </motion.div>
      </div>
    </SectionCard>
  );
};

import { ColorContext } from "@/contexts/color.context";
import { SectionNavContext } from "@/contexts/section-nav.context";
import { IconArrowDown, IconMail } from "@tabler/icons-react";
import { useContext } from "react";

export const HomeTitle = () => {
  const { color } = useContext(ColorContext);
  const { goToSection } = useContext(SectionNavContext);

  const name = "Hugo García Benjumea";
  const splittedName = name.split(" ").map((word, index) => {
    const isFirst = index === 0;
    return (
      <span
        key={word}
        className={`inline-block ${isFirst ? "text-primary-display" : ""}`}
        style={isFirst ? { color: "var(--primary-display)" } : undefined}
      >
        {word}
      </span>
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex justify-center md:justify-start">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-primary px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-tight text-primary-fg">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-fg opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-fg" />
            </span>
            Open to remote roles &amp; freelance
          </span>
        </div>

        <h1 className="flex flex-wrap justify-center md:justify-start gap-x-3 sm:gap-x-4">
          {splittedName}
        </h1>

        <div className="flex items-center justify-center md:justify-start gap-4 text-muted">
          <span
            className="hidden sm:block h-px w-8 sm:w-12 bg-primary shrink-0"
            style={{ backgroundColor: color }}
          ></span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            Full-Stack Engineer
          </h2>
        </div>
      </div>

      <p className="max-w-xl mx-auto md:mx-0 text-base sm:text-lg lg:text-xl text-muted leading-relaxed font-medium">
        I build web products end to end - database, API, and interface - in TypeScript and Node.js.
        I take them all the way: from an empty repo to a server I deploy and keep running.
      </p>

      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
        <button
          type="button"
          onClick={() => goToSection("Work")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:opacity-90 text-sm font-semibold text-primary-fg transition-opacity duration-200 cursor-pointer"
        >
          See the work
          <IconArrowDown size={18} stroke={2} />
        </button>
        <button
          type="button"
          onClick={() => goToSection("Contact")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card hover:border-primary/50 border border-border text-sm font-semibold text-text transition-colors duration-200 cursor-pointer"
        >
          Get in touch
          <IconMail size={18} stroke={1.5} />
        </button>
      </div>
    </div>
  );
};

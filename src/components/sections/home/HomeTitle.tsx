import { useContext } from "react";
import { ColorContext } from "@/contexts/color.context";

export const HomeTitle = () => {
  const { color } = useContext(ColorContext);

  const name = "Hugo García Benjumea";
  const splittedName = name.split(" ").map((word, index) => {
    const isFirst = index === 0;
    return (
      <span
        key={word}
        className={`inline-block ${isFirst ? "text-primary" : ""}`}
        style={isFirst ? { color } : undefined}
      >
        {word}
      </span>
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="flex flex-wrap justify-center md:justify-start gap-x-3 sm:gap-x-4">
          {splittedName}
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-4 text-muted">
          <span
            className="hidden sm:block h-px w-8 sm:w-12 bg-primary shrink-0"
            style={{ backgroundColor: color }}
          ></span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            Full Stack Developer
          </h2>
        </div>
      </div>
      <p className="max-w-xl mx-auto md:mx-0 text-base sm:text-lg lg:text-xl text-muted leading-relaxed font-medium">
        Building robust and beautiful digital experiences from front to back. Specialized in modern
        web technologies.
      </p>
    </div>
  );
};

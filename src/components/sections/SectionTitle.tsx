import type { ReactNode } from "react";
import { useContext } from "react";
import { ColorContext } from "@/contexts/color.context";

interface SectionTitleProps {
  children: ReactNode;
}

export const SectionTitle = ({ children }: SectionTitleProps) => {
  const { color } = useContext(ColorContext);

  return (
    <div className="flex items-center gap-6">
      <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-text">{children}</h2>
      <div
        className="h-1.5 flex-grow max-w-[80px] rounded-full opacity-80"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

import type { FC, ReactNode } from "react";

interface AboutIconsProps {
  title: string;
  iconsMapped: ReactNode[];
  color: string;
}

export const AboutIcons: FC<AboutIconsProps> = ({ title, iconsMapped }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted">{title}</h3>
      <div className="flex flex-wrap gap-3">{iconsMapped}</div>
    </div>
  );
};

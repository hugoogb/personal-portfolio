import type { FC, ReactNode } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

interface ExternalLinkButtonProps {
  id?: string;
  text: string;
  link: string;
  icon?: Icon;
  children?: ReactNode;
}

export const ExternalLinkButton: FC<ExternalLinkButtonProps> = ({
  id,
  text,
  link,
  icon,
}) => {
  const IconComponent = icon;

  return (
    <a
      key={id}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-muted/10 hover:bg-muted/20 border border-border/50 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-sm"
    >
      {IconComponent && (
        <IconComponent
          stroke={1.5}
          size={18}
          className="text-text"
        />
      )}
      <span>{text}</span>
      <IconExternalLink size={14} className="text-muted" />
    </a>
  );
};

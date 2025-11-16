import type { FC, ReactNode } from "react";
import styles from "@/styles/modules/shared/ExternalLinkButton.module.css";
import { IconExternalLink } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { ICON_SIZES } from "@/constants/design.constants";

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
  children,
}) => {
  const IconComponent = icon;

  return (
    <a
      key={id}
      className={`button ${styles.anchor}`}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.iconButton}>
        <IconComponent
          stroke={1.25}
          size={ICON_SIZES.md}
          className={styles.icon}
        />
        <p>{text}</p>
        <div className={styles.arrowLink}>
          <IconExternalLink size={ICON_SIZES.sm} />
        </div>
      </div>
    </a>
  );
};

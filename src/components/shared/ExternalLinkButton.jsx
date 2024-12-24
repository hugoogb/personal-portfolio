import styles from "@/styles/modules/shared/ExternalLinkButton.module.css";
import { IconExternalLink } from "@tabler/icons-react";

export const ExternalLinkButton = ({ id, text, link, icon, children }) => {
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
          color={"var(--text-color)"}
          size={24}
          className={styles.icon}
        />
        <p>{text}</p>
        <div className={styles.arrowLink}>
          <IconExternalLink color={"var(--text-color)"} size={20} />
        </div>
      </div>
    </a>
  );
};

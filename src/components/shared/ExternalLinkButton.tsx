import styles from "@/styles/modules/shared/ExternalLinkButton.module.css";
import { IconExternalLink } from "@tabler/icons-react";

interface ExternalLinkButtonProps {
  id: any;
  text: any;
  link: any;
  icon: any;
  children: ReactNode;
}

export const ExternalLinkButton: FC<ExternalLinkButtonProps> = ({ id, text, link, icon, children  }) => {
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
        <IconComponent stroke={1.25} size={24} className={styles.icon} />
        <p>{text}</p>
        <div className={styles.arrowLink}>
          <IconExternalLink size={20} />
        </div>
      </div>
    </a>
  );
};

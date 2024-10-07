import styles from "@/styles/modules/Footer.module.css";
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconExternalLink,
} from "@tabler/icons-react";

export const Footer = () => {
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
    // {
    // 	id: 2,
    // 	name: "Twitter",
    // 	icon: IconBrandTwitter,
    // 	link: "https://twitter.com/hugoo_gb",
    // },
    // {
    // 	id: 3,
    // 	name: "Instagram",
    // 	icon: IconBrandInstagram,
    // 	link: "https://www.instagram.com/hugoo_gb/",
    // },
  ];

  const socialsMapped = socials.map((social) => {
    return (
      <a
        key={social.id}
        className={`button ${styles.anchorSocial}`}
        href={social.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={styles.socialIconButton}>
          <social.icon
            color={"var(--text-color)"}
            size={24}
            className={styles.socialIcon}
          />
          <p>{social.name}</p>
          <div className={styles.arrowLink}>
            <IconExternalLink color={"var(--text-color)"} size={20} />
          </div>
        </div>
      </a>
    );
  });

  return (
    <footer className={styles.footer}>
      <div className={styles.footerAbsolute}>
        <div className={styles.footerWrapper}>
          <div className={styles.footerContainer}>{socialsMapped}</div>
        </div>
      </div>
    </footer>
  );
};

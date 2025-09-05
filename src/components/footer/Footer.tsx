import styles from "@/styles/modules/Footer.module.css";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import { ExternalLinkButton } from "../shared/ExternalLinkButton";

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
  ];

  const socialsMapped = socials.map((social) => {
    return (
      <ExternalLinkButton
        key={social.id}
        text={social.name}
        link={social.link}
        icon={social.icon}
      />
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

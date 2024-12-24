import styles from "@/styles/modules/Footer.module.css";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconExternalLink,
} from "@tabler/icons-react";
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

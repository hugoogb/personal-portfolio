import styles from "@/styles/modules/Footer.module.css";
import { ButtonCV } from "@/components/header/navbar/ButtonCV.jsx";
import {
	LogoGithub,
	LogoLinkedin,
	LogoTwitter,
	LogoInstagram,
	ArrowForward,
} from "react-ionicons";

export const Footer = () => {
	const socials = [
		{
			id: 0,
			name: "GitHub",
			icon: LogoGithub,
			link: "https://github.com/hugoogb",
		},
		{
			id: 1,
			name: "LinkedIn",
			icon: LogoLinkedin,
			link: "https://www.linkedin.com/in/hugoogb/",
		},
		{
			id: 2,
			name: "Twitter",
			icon: LogoTwitter,
			link: "https://twitter.com/hugoo_gb",
		},
		{
			id: 3,
			name: "Instagram",
			icon: LogoInstagram,
			link: "https://www.instagram.com/hugoo_gb/",
		},
	];

	const socialsMapped = socials.map((social) => {
		return (
			<a
				key={social.id}
				className={`button ${styles.anchorSocial}`}
				href={social.link}
				target='_blank'
				rel='noopener noreferrer'
			>
				<div className={styles.socialIconButton}>
					<social.icon
						color={"var(--text-color)"}
						width='24px'
						height='24px'
						title={social.name}
						cssClasses={styles.socialIcon}
					/>
					<p>{social.name}</p>
					<div className={styles.arrowLink}>
						<ArrowForward
							color={"var(--text-color)"}
							width='24px'
							height='24px'
							title='Follow link'
						/>
					</div>
				</div>
			</a>
		);
	});

	return (
		<footer className={styles.footer}>
			<div className={styles.footerWrapper}>
				<div className={styles.footerContainer}>
					<div className={styles.socialsContainer}>
						{socialsMapped}
					</div>
					<ButtonCV></ButtonCV>
				</div>
			</div>
		</footer>
	);
};

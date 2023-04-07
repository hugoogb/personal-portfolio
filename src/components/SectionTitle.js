import localFont from "next/font/local";
import styles from "../styles/Section.module.css";

const cyGroteskKey = localFont({
	src: [
		{
			path: "../pages/fonts/Cy.Grotesk/Cy Grotesk Key Regular.ttf",
			weight: "400",
			style: "normal",
		},
	],
});

export function SectionTitle({ children }) {
	return (
		<div className={cyGroteskKey.className}>
			<h2 className={styles.sectionTitle}>{children}</h2>
		</div>
	);
}

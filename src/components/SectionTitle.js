import localFont from "next/font/local";
import styles from "../styles/Section.module.css";
import { useContext } from "react";
import { ThemeContext } from "./PortfolioLayout.js";

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
	const theme = useContext(ThemeContext);

	return (
		<div className={cyGroteskKey.className}>
			<h2 className={styles.sectionTitle} style={{ color: theme }}>
				{children}
			</h2>
		</div>
	);
}

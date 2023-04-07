import styles from "../styles/Header.module.css";
import localFont from "next/font/local";

const cyGroteskGrandBold = localFont({
	src: [
		{
			path: "../pages/fonts/Cy.Grotesk/Cy Grotesk Grand Bold.ttf",
			weight: "700",
			style: "normal",
		},
	],
});

export function Header() {
	const name = "Hugo Garcia Benjumea";

	return (
		<header className={cyGroteskGrandBold.className}>
			<h1 className={styles.nameHeader}>{name}</h1>
		</header>
	);
}

import styles from "../styles/Header.module.css";
import localFont from "next/font/local";
import { useContext } from "react";
import { ColorContext } from "./PortfolioLayout.js";

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
	const color = useContext(ColorContext);

	const name = "Hugo García Benjumea";
	const splittedName = name.split(" ").map((word) => {
		return word === name.split(" ")[0] ? (
			<span
				className={styles.spanTitle}
				style={{ color: color }}
				key={word}
			>
				{word}
				<br></br>
			</span>
		) : (
			<span key={word}>
				{word}
				<br></br>
			</span>
		);
	});

	return (
		<section className={cyGroteskGrandBold.className}>
			<div className={styles.headerWrapper}>
				<div className={styles.headerContainer}>
					<h1 className={styles.nameHeader}>{splittedName}</h1>
					<div className={styles.profileImageContainer}>
						<div
							style={{ background: color }}
							className={styles.profileImageBackground}
						></div>
					</div>
				</div>
			</div>
		</section>
	);
}

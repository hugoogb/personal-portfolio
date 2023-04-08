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
	const name = "Hugo García Benjumea";
	const splittedName = name.split(" ").map((word) => {
		return word === name.split(" ")[0] ? (
			<span style={{ color: "red" }} key={word}>
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
						<div className={styles.profileImage}></div>
					</div>
				</div>
			</div>
		</section>
	);
}

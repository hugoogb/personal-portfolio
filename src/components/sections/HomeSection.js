import styles from "../../styles/modules/Home.module.css";
import localFont from "next/font/local";
import { useContext } from "react";
import { ColorContext } from "../PortfolioLayout.js";
import Image from "next/image";

const cyGroteskGrandBold = localFont({
	src: [
		{
			path: "../../pages/fonts/Cy.Grotesk/Cy Grotesk Grand Bold.ttf",
			weight: "700",
			style: "normal",
		},
	],
});

export function HomeSection() {
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
		<section id='home' className={cyGroteskGrandBold.className}>
			<div className={styles.headerWrapper}>
				<div className={styles.headerContainer}>
					<h1 className={styles.nameHeader}>{splittedName}</h1>
					<div className={styles.profileImageContainer}>
						<div
							style={{ background: color }}
							className={styles.profileImageBackground}
						>
							<Image
								src={
									"https://res.cloudinary.com/hugoogb/image/upload/v1681508123/IMG_2347-removebg-preview_bfhe2e.png"
								}
								alt={"Profile picture of hugoogb"}
								width={433}
								height={577}
								className={styles.profileImage}
							></Image>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

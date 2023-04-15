import styles from "../../styles/modules/Home.module.css";
import sectionStyles from "../../styles/modules/Section.module.css";
import localFont from "next/font/local";
import { useContext } from "react";
import { ColorContext } from "../PortfolioLayout.js";
import Image from "next/image";
import { ArrowDown } from "../ArrowDown";

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

	const spanTitleStyles = Object.assign(
		{},
		{ color: color },
		{ letterSpacing: "0.75rem" },
		{ fontSize: "min(88px, 8vw)" }
	);

	const name = "Hugo García Benjumea";
	const splittedName = name.split(" ").map((word) => {
		return word === name.split(" ")[0] ? (
			<span
				className={styles.spanTitle}
				style={spanTitleStyles}
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

	const homeSectionStyles = Object.assign(
		{},
		{ paddingTop: "20rem" },
		{ marginTop: "0rem" }
	);

	return (
		<>
			<section
				id='home'
				style={homeSectionStyles}
				className={sectionStyles.section}
			>
				<div className={cyGroteskGrandBold.className}>
					<div className={styles.headerContainer}>
						<div className={styles.nameHeaderTextContainer}>
							<h1 className={styles.nameHeader}>
								{splittedName}
							</h1>
							<h2 className={styles.subtitleHeader}>
								<span style={{ backgroundColor: color }}></span>
								Web developer
							</h2>
						</div>
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
			<ArrowDown nextSection={"about"}></ArrowDown>
		</>
	);
}

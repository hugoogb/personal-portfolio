import { useContext } from "react";
import Image from "next/image";
import { Hanken_Grotesk } from "next/font/google";
import { useTranslation } from "react-i18next";
import sectionStyles from "@/styles/modules/Section.module.css";
import styles from "@/styles/modules/Home.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { ButtonCV } from "@/components/navbar/ButtonCV.jsx";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

export function HomeSection() {
	const { t } = useTranslation();

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
		<section id={t("nav.home")} className={sectionStyles.section}>
			<div className={hankenGrotesk.className}>
				<div className={styles.headerContainer}>
					<div className={styles.nameHeaderTextContainer}>
						<h1 className={styles.nameHeader}>{splittedName}</h1>
						<h2 className={styles.subtitleHeader}>
							<span style={{ backgroundColor: color }}></span>
							{t("home.subtitle")}
						</h2>
						<div style={{ alignSelf: "flex-end" }}>
							<ButtonCV></ButtonCV>
						</div>
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
								fill={true}
								sizes='(max-width: 720px) 300px, 500px'
								priority={true}
								className={styles.profileImage}
							></Image>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

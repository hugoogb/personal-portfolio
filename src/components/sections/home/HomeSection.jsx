import { useContext } from "react";
import Image from "next/image";
import { Hanken_Grotesk } from "next/font/google";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Home.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { ButtonCV } from "@/components/header/navbar/ButtonCV.jsx";
import memoji from "/public/memojis/image3.png";

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
		<section id={t("nav.home")} className='section'>
			<div className={hankenGrotesk.className}>
				<div className='cardWrapper'>
					<div className='cardContainer'>
						<div className={styles.headerContainer}>
							<div className={styles.nameHeaderTextContainer}>
								<h1 className={styles.nameHeader}>
									{splittedName}
								</h1>
								<h2 className={styles.subtitleHeader}>
									<span
										style={{ backgroundColor: color }}
									></span>
									{t("home.subtitle")}
								</h2>
								<div style={{ alignSelf: "flex-end" }}>
									<ButtonCV></ButtonCV>
								</div>
							</div>
							<div
								style={{ background: color }}
								className={styles.profileImageBackground}
							>
								<Image
									src={memoji}
									alt={"Memoji of Hugo GB"}
									fill={true}
									sizes='(max-width: 720px) 250px, (max-width: 920px) 300px, 375px'
									priority={true}
									className={styles.profileImage}
								></Image>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

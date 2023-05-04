import { useContext } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Home.module.css";
import { ColorContext } from "@/components/Layout.jsx";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

export const HomeTitle = () => {
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
		<div className={hankenGrotesk.className}>
			<div className={styles.nameSubtitleContainer}>
				<h1 className={styles.nameHeader}>{splittedName}</h1>
				<h2 className={styles.subtitleHeader}>
					<span style={{ backgroundColor: color }}></span>
					{t("home.subtitle")}
				</h2>
			</div>
		</div>
	);
};

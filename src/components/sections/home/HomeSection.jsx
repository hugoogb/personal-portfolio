import { useContext } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Home.module.css";
import stylesSection from "@/styles/modules/Section.module.css";
import { ColorContext } from "@/components/Layout.jsx";
import { ButtonCV } from "@/components/header/navbar/ButtonCV.jsx";
import memoji from "/public/memojis/image3.png";
import { HomeTitle } from "@/components/sections/home/HomeTitle.jsx";

export function HomeSection() {
	const { t } = useTranslation();

	const color = useContext(ColorContext);

	return (
		<section id={t("nav.home")} className={stylesSection.section}>
			<div className={stylesSection.cardWrapper}>
				<div className={stylesSection.cardContainer}>
					<div className={styles.headerContainer}>
						<div className={styles.nameHeaderTextContainer}>
							<HomeTitle></HomeTitle>
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
		</section>
	);
}

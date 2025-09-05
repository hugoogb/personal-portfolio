import type { FC } from 'react';
import {  useContext, useState  } from 'react';
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Home.module.css";
import stylesSection from "@/styles/modules/Section.module.css";
import { ColorContext } from "@/components/Layout";
import { ButtonCV } from "@/components/header/navbar/ButtonCV";
import memoji from "/public/memojis/image3.png";
import memoji2 from "/public/memojis/image0.png";
import { HomeTitle } from "@/components/sections/home/HomeTitle";
import { IconRefresh } from "@tabler/icons-react";

export function HomeSection() {
	const { t } = useTranslation();

	const { color } = useContext(ColorContext);

	const [activeImage, setActiveImage] = useState(0);

	return (
		<section id={t("nav.home")} className={stylesSection.section}>
			<div className={stylesSection.cardWrapper}>
				<div className={stylesSection.cardContainer}>
					<div className={styles.headerContainer}>
						<div className={styles.nameHeaderTextContainer}>
							<HomeTitle></HomeTitle>
							{/* <div style={{ alignSelf: "flex-end" }}> */}
							{/* <ButtonCV></ButtonCV> */}
							{/* </div> */}
						</div>
						<div
							style={{ background: color }}
							className={`imageContainer ${styles.profileImageBackground}`}
						>
							{activeImage === 0 ? (
								<Image
									src={memoji}
									alt={"Memoji of Hugo GB"}
									fill={true}
									sizes='(max-width: 720px) 250px, (max-width: 920px) 300px, 375px'
									priority={true}
									className={`image ${styles.profileImage}`}
								></Image>
							) : (
								<Image
									src={memoji2}
									alt={"Memoji of Hugo GB"}
									fill={true}
									sizes='(max-width: 720px) 250px, (max-width: 920px) 300px, 375px'
									priority={true}
									className={`image ${styles.profileImage}`}
								></Image>
							)}
							<div className={styles.iconChangeImage}>
								<button
									className='button'
									onClick={() =>
										setActiveImage(
											activeImage === 0 ? 1 : 0
										)
									}
								>
									<IconRefresh size={24}></IconRefresh>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

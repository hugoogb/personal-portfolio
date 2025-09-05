import Image from "next/image";
import type { FC } from 'react';
import {  useContext  } from 'react';
import { Hanken_Grotesk } from "next/font/google";
import { ColorContext } from "@/components/Layout";
import styles from "@/styles/modules/Section.module.css";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

export function SectionTitle({ memoji, children }) {
	const { color } = useContext(ColorContext);

	return (
		<div className={hankenGrotesk.className}>
			<div className={styles.sectionTitleContainer}>
				<Image
					src={memoji}
					alt={`${children} section memoji`}
					width={75}
					height={75}
				/>
				<h2 className={styles.sectionTitle} style={{ color: color }}>
					{children}
				</h2>
			</div>
		</div>
	);
}

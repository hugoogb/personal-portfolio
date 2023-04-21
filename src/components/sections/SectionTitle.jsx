import { useContext } from "react";
import { Hanken_Grotesk } from "next/font/google";
import styles from "@/styles/modules/Section.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

export function SectionTitle({ children }) {
	const color = useContext(ColorContext);

	return (
		<div className={hankenGrotesk.className}>
			<h2 className={styles.sectionTitle} style={{ color: color }}>
				{children}
			</h2>
		</div>
	);
}
import { useContext } from "react";
import { ColorContext } from "./PortfolioLayout";
import styles from "../styles/modules/Navbar.module.css";

export const Logo = ({ end }) => {
	const color = useContext(ColorContext);

	return (
		<div className={styles.logoContainer}>
			<span>{end ? "</" : "<"}</span>
			<span className={styles.logoSpan} style={{ color: color }}>
				{" "}
				H{" "}
			</span>
			<span>{">"}</span>
		</div>
	);
};

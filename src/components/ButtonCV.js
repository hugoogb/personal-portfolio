import { useContext } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorContext } from "./PortfolioLayout";

export const ButtonCV = () => {
	const color = useContext(ColorContext);

	return (
		<button style={{ backgroundColor: color }} className={styles.buttonCV}>
			Download CV
		</button>
	);
};

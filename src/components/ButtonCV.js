import { useContext } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorContext } from "./PortfolioLayout";

export const ButtonCV = ({ downloadUrl, fileName }) => {
	const color = useContext(ColorContext);

	const handleDownload = async () => {
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<button
			onClick={handleDownload}
			style={{ backgroundColor: color }}
			className={styles.buttonCV}
		>
			Download CV
		</button>
	);
};

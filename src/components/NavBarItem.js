import { useContext } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorContext } from "./PortfolioLayout";

export const NavBarItem = ({ id, activeId, children }) => {
	const color = useContext(ColorContext);

	const spanStyles = Object.assign(
		{},
		{ backgroundColor: color },
		{ width: activeId === id ? "35px" : "0" }
	);

	const handleSectionClick = (event) => {
		event.preventDefault();
		const section = document.getElementById(children.toLowerCase());
		section.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<li className={styles.navItem}>
			<a
				href=''
				style={{ fontWeight: activeId === id ? "600" : "400" }}
				onClick={handleSectionClick}
			>
				{children}
				<span style={spanStyles} className={styles.navItemBar}></span>
			</a>
		</li>
	);
};

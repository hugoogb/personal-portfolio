import { useContext } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorContext } from "./PortfolioLayout";

export const NavItem = ({ id, activeId, setActiveId, children }) => {
	const color = useContext(ColorContext);

	const spanStyles = Object.assign(
		{},
		{ backgroundColor: color },
		{ width: activeId === id ? "35px" : "0" }
	);

	return (
		<li className={styles.navItem}>
			<a
				href={"#" + children.toLowerCase()}
				onClick={() => setActiveId(id)}
				style={{ fontWeight: activeId === id ? "600" : "400" }}
			>
				{children}
				<span style={spanStyles} className={styles.navItemBar}></span>
			</a>
		</li>
	);
};

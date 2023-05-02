import { useContext } from "react";
import styles from "@/styles/modules/Header.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";

export const NavBarItem = ({ id, activeId, children }) => {
	const color = useContext(ColorContext);

	const spanStyles = Object.assign(
		{},
		{ backgroundColor: color },
		{ width: activeId === id ? "35px" : "0" }
	);

	const handleSectionClickOffset = (event, offset = 0) => {
		event.preventDefault();
		const section = document.getElementById(children);
		const sectionTop = section.getBoundingClientRect().top;
		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop;
		const finalScrollTop = scrollTop + sectionTop - offset;
		window.scrollTo({
			top: finalScrollTop,
			behavior: "smooth",
		});
	};

	const handleSectionClick = (event) => {
		handleSectionClickOffset(event, 100);
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

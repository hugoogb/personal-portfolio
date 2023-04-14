import { useState } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorPicker } from "./ColorPicker";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";

export function Navbar({ setColor }) {
	const [activeId, setActiveId] = useState(0);

	const navItems = [
		{ id: 0, name: "Home" },
		{ id: 1, name: "About" },
		{ id: 2, name: "Projects" },
		{ id: 3, name: "Contact" },
	];

	const navItemsMapped = navItems.map((item) => {
		return (
			<NavItem
				key={item.id}
				id={item.id}
				activeId={activeId}
				setActiveId={setActiveId}
			>
				{item.name}
			</NavItem>
		);
	});

	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<Logo end={false}></Logo>
				<ul className={styles.ulNavbar}>{navItemsMapped}</ul>
				<Logo end={true}></Logo>
			</div>
			<ColorPicker setColor={setColor}></ColorPicker>
		</nav>
	);
}

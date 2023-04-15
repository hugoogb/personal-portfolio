import { useState, useEffect, useMemo } from "react";
import styles from "../styles/modules/Navbar.module.css";
import { ColorPicker } from "./ColorPicker";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";

export function Navbar({ setColor }) {
	const [activeId, setActiveId] = useState(0);

	const memoizedNavItems = useMemo(() => {
		return [
			{ id: 0, name: "Home" },
			{ id: 1, name: "About" },
			{ id: 2, name: "Projects" },
			{ id: 3, name: "Contact" },
		];
	}, []);

	const navItemsMapped = memoizedNavItems.map((item) => {
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

	useEffect(() => {
		// Function to check for currently viewed section
		const handleScroll = () => {
			// Get current vertical scroll position
			const scrollPosition = window.pageYOffset;

			// Loop through all sections on the page
			const sections = document.querySelectorAll("section");
			for (let i = 0; i < sections.length; i++) {
				const section = sections[i];

				// Check if section is within viewable area
				if (
					section.offsetTop + section.offsetHeight > scrollPosition &&
					section.offsetTop < scrollPosition + window.innerHeight
				) {
					const sectionName = section.getAttribute("id");
					const activeSectionId = memoizedNavItems.findIndex(
						(section) => {
							return section.name.toLowerCase() == sectionName;
						}
					);
					setActiveId(activeSectionId);
					break; // Stop looping once we find the first section in view
				}
			}
		};

		// Add event listener for scroll events
		window.addEventListener("scroll", handleScroll);

		// Remove event listener on component unmount
		return () => window.removeEventListener("scroll", handleScroll);
	}, [memoizedNavItems]);

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

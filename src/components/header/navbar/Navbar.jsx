import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Bars3Icon } from "@heroicons/react/24/outline";
import styles from "@/styles/modules/Header.module.css";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu.jsx";
import { NavBarItem } from "@/components/header/navbar/NavBarItem.jsx";
import { ButtonCV } from "@/components/header/navbar/ButtonCV.jsx";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";

export function Navbar({ setColor }) {
	const { t } = useTranslation();

	const [activeId, setActiveId] = useState(null);
	const [visibility, setVisibility] = useState(false);
	const navbarRef = useRef(null);
	const iconMenuNavbarRef = useRef(null);

	const memoizedNavItems = useMemo(() => {
		return [
			{ id: 0, name: t("nav.home") },
			{ id: 1, name: t("nav.about") },
			{ id: 2, name: t("nav.projects") },
			{ id: 3, name: t("nav.contact") },
		];
	}, [t]);

	const navItemsMapped = memoizedNavItems.map((item) => {
		return (
			<NavBarItem key={item.id} id={item.id} activeId={activeId}>
				{item.name}
			</NavBarItem>
		);
	});

	useEffect(() => {
		const handleScroll = () => {
			// Get current vertical scroll position
			const scrollPosition = window.pageYOffset + 200; // add 100px offset

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
							return section.name == sectionName;
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

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				navbarRef.current &&
				!navbarRef.current.contains(event.target) &&
				iconMenuNavbarRef.current &&
				!iconMenuNavbarRef.current.contains(event.target)
			) {
				setVisibility(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const ulNavbarMobileStyles = Object.assign(
		{},
		{
			height: visibility ? "220px" : "0",
		},
		{
			overflow: visibility ? "auto" : "hidden",
		},
		{
			border: visibility ? "var(--border-nav)" : "none",
		}
	);

	return (
		<header className={styles.header}>
			<nav className={styles.navbar}>
				<ul ref={navbarRef} className={styles.ulNavbar}>
					{navItemsMapped}
				</ul>
				<ul
					ref={navbarRef}
					style={ulNavbarMobileStyles}
					className={styles.ulNavbarMobile}
				>
					{navItemsMapped}
				</ul>
				<div
					ref={iconMenuNavbarRef}
					className={styles.menuIconContainer}
					onClick={() => setVisibility(!visibility)}
				>
					<Bars3Icon className={styles.menuIcon} />
				</div>
			</nav>
			<div className={styles.buttonColorPickerContainer}>
				<DarkModeToggle></DarkModeToggle>
				<div className={styles.buttonCVnav}>
					<ButtonCV></ButtonCV>
				</div>
				<SettingsMenu setColor={setColor}></SettingsMenu>
			</div>
		</header>
	);
}

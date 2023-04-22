import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bars3Icon } from "@heroicons/react/24/outline";
import styles from "@/styles/modules/Navbar.module.css";
import { SettingsMenu } from "@/components/navbar/SettingsMenu.jsx";
import { NavBarItem } from "@/components/navbar/NavBarItem.jsx";
import { ButtonCV } from "@/components/navbar/ButtonCV.jsx";

export function Navbar({ setColor }) {
	const { t } = useTranslation();

	const [activeId, setActiveId] = useState(null);
	const [display, setDisplay] = useState("");
	const [visibility, setVisibility] = useState(false);

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
		const handleResize = () => {
			const width = window.innerWidth;
			if (width <= 920) {
				setDisplay("mobile");
			} else {
				setDisplay("desktop");
			}
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const ulNavbarStyles = Object.assign(
		{},
		{
			height:
				display === "mobile" ? (visibility ? "220px" : "0") : "auto",
		},
		{
			overflow: visibility ? "auto" : "hidden",
		}
	);

	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<ul style={ulNavbarStyles} className={styles.ulNavbar}>
					{navItemsMapped}
				</ul>
				<div className={styles.menuIconContainer}>
					<Bars3Icon
						onClick={() => setVisibility(visibility ? false : true)}
						className={styles.menuIcon}
					/>
				</div>
			</div>
			<div className={styles.buttonColorPickerContainer}>
				<ButtonCV></ButtonCV>
				<SettingsMenu setColor={setColor}></SettingsMenu>
			</div>
		</nav>
	);
}

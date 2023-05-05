import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Header.module.css";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu.jsx";
import { NavBarItem } from "@/components/header/navbar/NavBarItem.jsx";
import { ButtonCV } from "@/components/header/navbar/ButtonCV.jsx";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";
import { IconMenu2 } from "@tabler/icons-react";

export function Navbar({ setColor }) {
	const { t } = useTranslation();

	const [activeId, setActiveId] = useState(null);
	const [visibility, setVisibility] = useState(false);
	const navbarRef = useRef(null);
	const iconMenuNavbarRef = useRef(null);

	const navItems = [
		{ id: 0, name: t("nav.home"), href: "/" },
		{ id: 1, name: t("nav.about"), href: "/about" },
		{ id: 2, name: t("nav.projects"), href: "/projects" },
		{ id: 3, name: t("nav.contact"), href: "/contact" },
	];

	const navItemsMapped = navItems.map((item) => {
		return (
			<NavBarItem
				key={item.id}
				href={item.href}
				id={item.id}
				setActiveId={setActiveId}
				activeId={activeId}
			>
				{item.name}
			</NavBarItem>
		);
	});

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
		<div className={styles.headerContainer}>
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
					<IconMenu2
						size={48}
						className={styles.menuIcon}
					></IconMenu2>
				</div>
			</nav>
			<div className={styles.buttonColorPickerContainer}>
				<DarkModeToggle></DarkModeToggle>
				<div className={styles.buttonCVnav}>
					<ButtonCV></ButtonCV>
				</div>
				<SettingsMenu setColor={setColor}></SettingsMenu>
			</div>
		</div>
	);
}

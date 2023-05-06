import { useContext, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/Layout.jsx";
import { LanguageSelector } from "@/components/header/navbar/LanguageSelector.jsx";
// import { IconSettings } from "@tabler/icons-react";

export const SettingsMenu = ({ setColor }) => {
	const color = useContext(ColorContext);
	const [visibility, setVisibility] = useState(false);
	const settingsRef = useRef(null);
	const iconSettingsRef = useRef(null);

	useEffect(() => {
		const savedColor = localStorage.getItem("color");

		if (savedColor) {
			setColor(savedColor);
		}
	}, [setColor]);

	const handleColorChange = (color) => {
		setColor(color);
		localStorage.setItem("color", color);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				settingsRef.current &&
				!settingsRef.current.contains(event.target) &&
				iconSettingsRef.current &&
				!iconSettingsRef.current.contains(event.target)
			) {
				setVisibility(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const settingsWrapperStyles = Object.assign(
		{},
		{
			height: visibility ? "475px" : "0",
		},
		{ overflow: visibility ? "auto" : "hidden" }
	);

	return (
		<>
			<div
				ref={settingsRef}
				style={settingsWrapperStyles}
				className={styles.settingsWrapper}
			>
				<div className={styles.settingsContainer}>
					<LanguageSelector></LanguageSelector>
					<HexColorPicker
						color={color}
						onChange={handleColorChange}
					></HexColorPicker>
				</div>
			</div>
			<div
				ref={iconSettingsRef}
				className={styles.settingsIconContainer}
				onClick={() => setVisibility(!visibility)}
			>
				{/* <IconSettings
					size={48}
					className={styles.settingsIcon}
				></IconSettings> */}
			</div>
		</>
	);
};

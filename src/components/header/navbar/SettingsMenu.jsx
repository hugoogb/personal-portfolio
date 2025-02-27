import { useContext, useEffect, useRef, useState } from "react";
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/Layout.jsx";
import { LanguageSelector } from "@/components/header/navbar/LanguageSelector.jsx";
import { IconSettings } from "@tabler/icons-react";

export const SettingsMenu = () => {
	const { color, setColor } = useContext(ColorContext);
	const [visibility, setVisibility] = useState(false);
	const [HexColorPicker, setHexColorPicker] = useState(null);
	const settingsRef = useRef(null);
	const iconSettingsRef = useRef(null);

	// Load the color picker component only on the client side
	useEffect(() => {
		// Dynamically import the HexColorPicker
		import('react-colorful').then(mod => {
			setHexColorPicker(() => mod.HexColorPicker);
		});
	}, []);

	const handleColorChange = (newColor) => {
		setColor(newColor);
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
					{HexColorPicker && (
						<div className={styles.colorPickerWrapper}>
							<HexColorPicker color={color} onChange={handleColorChange} />
						</div>
					)}
				</div>
			</div>
			<div
				ref={iconSettingsRef}
				className={styles.settingsIconContainer}
				onClick={() => setVisibility(!visibility)}
			>
				<IconSettings
					size={48}
					className={styles.settingsIcon}
				></IconSettings>
			</div>
		</>
	);
};

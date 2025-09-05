import type { FC, ComponentType, MouseEvent } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/Layout";
import { LanguageSelector } from "@/components/header/navbar/LanguageSelector";
import { IconSettings } from "@tabler/icons-react";

type HexColorPickerType = ComponentType<{ color: string; onChange: (color: string) => void }>;

export const SettingsMenu: FC = () => {
	const { color, setColor } = useContext(ColorContext);
	const [visibility, setVisibility] = useState<boolean>(false);
	const [HexColorPicker, setHexColorPicker] = useState<HexColorPickerType | null>(null);
	const settingsRef = useRef<HTMLDivElement>(null);
	const iconSettingsRef = useRef<HTMLDivElement>(null);

	// Load the color picker component only on the client side
	useEffect(() => {
		// Dynamically import the HexColorPicker
		import('react-colorful').then(mod => {
			setHexColorPicker(() => mod.HexColorPicker as HexColorPickerType);
		});
	}, []);

	const handleColorChange = (newColor: string) => {
		setColor(newColor);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | Event) => {
			const target = event.target as Node;
			if (
				settingsRef.current &&
				!settingsRef.current.contains(target) &&
				iconSettingsRef.current &&
				!iconSettingsRef.current.contains(target)
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

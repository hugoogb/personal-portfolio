import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "../styles/ColorPicker.module.css";
import { ListColorPickerItem } from "./ListColorPickerItem";
import { useState } from "react";

export function ColorPicker({ onClick }) {
	const colors = [
		"#ff0000",
		"#0000ff",
		"#008000",
		"#ffff00",
		"#ffa500",
		"#800080",
		"#ffc0cb",
	];

	const handleClickChangeTheme = (color) => {
		onClick(color);
		handleSettingsClick();
	};

	const colorsMapped = colors.map((color) => {
		return (
			<ListColorPickerItem
				key={color}
				color={color}
				onClick={handleClickChangeTheme}
			/>
		);
	});

	const [display, setDisplay] = useState("none");

	const handleSettingsClick = () => {
		display === "none" ? setDisplay("flex") : setDisplay("none");
	};

	return (
		<div className={styles.colorPickerWrapper}>
			<div className={styles.colorPickerContainer}>
				<ul
					className={styles.listColorPicker}
					style={{
						opacity: display === "none" ? 0 : 1,
					}}
				>
					{colorsMapped}
				</ul>
				<Cog6ToothIcon
					onClick={handleSettingsClick}
					className={styles.settingsIcon}
				/>
			</div>
		</div>
	);
}

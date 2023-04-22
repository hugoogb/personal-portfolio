import { useContext, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { LanguageSelector } from "@/components/navbar/LanguageSelector.jsx";

export function SettingsMenu({ setColor }) {
	const color = useContext(ColorContext);
	const [display, setDisplay] = useState(false);

	const settingsWrapperStyles = Object.assign(
		{},
		{ height: display ? "337px" : "0" },
		{ overflow: display ? "auto" : "hidden" }
	);

	return (
		<div className={styles.settingsContainer}>
			<div
				style={settingsWrapperStyles}
				className={styles.settingsWrapper}
			>
				<div className={styles.settingsContainer}>
					<LanguageSelector></LanguageSelector>
					<div className={styles.colorPickerContainer}>
						<HexColorPicker
							color={color}
							onChange={setColor}
						></HexColorPicker>
					</div>
				</div>
			</div>
			<div className={styles.settingsIconContainer}>
				<Cog6ToothIcon
					onClick={() => setDisplay(display ? false : true)}
					className={styles.settingsIcon}
				/>
			</div>
		</div>
	);
}

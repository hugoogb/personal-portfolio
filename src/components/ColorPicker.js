import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "../styles/modules/ColorPicker.module.css";
import { useContext, useState } from "react";
import { ColorContext } from "./PortfolioLayout";
import { HexColorPicker } from "react-colorful";

export function ColorPicker({ setColor }) {
	const color = useContext(ColorContext);
	const [display, setDisplay] = useState(false);

	return (
		<div className={styles.pickerContainer}>
			<div
				style={{ display: display ? "inline-block" : "none" }}
				className={styles.colorPickerContainer}
			>
				<HexColorPicker
					color={color}
					onChange={setColor}
				></HexColorPicker>
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

import { useContext, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/modules/ColorPicker.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";

export function ColorPicker({ setColor }) {
	const color = useContext(ColorContext);
	const [display, setDisplay] = useState(false);

	const colorPickerWrapperStyles = Object.assign(
		{},
		{ height: display ? "232px" : "0" },
		{ overflow: display ? "auto" : "hidden" }
	);

	return (
		<div className={styles.pickerContainer}>
			<div
				style={colorPickerWrapperStyles}
				className={styles.colorPickerWrapper}
			>
				<div className={styles.colorPickerContainer}>
					<HexColorPicker
						color={color}
						onChange={setColor}
					></HexColorPicker>
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

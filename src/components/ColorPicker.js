import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "../styles/ColorPicker.module.css";
import { ListColorPickerItem } from "./ListColorPickerItem";

export function ColorPicker() {
	const colors = [
		"#ff0000",
		"#0000ff",
		"#008000",
		"#ffff00",
		"#ffa500",
		"#800080",
		"#ffc0cb",
	];
	const colorsMapped = colors.map((color) => {
		return <ListColorPickerItem key={color} color={color} />;
	});

	return (
		<div className={styles.colorPickerWrapper}>
			<div className={styles.colorPickerContainer}>
				<ul className={styles.listColorPicker}>{colorsMapped}</ul>
				<Cog6ToothIcon className={styles.settingsIcon} />
			</div>
		</div>
	);
}

import styles from "../styles/ColorPicker.module.css";

export function ListColorPickerItem({ color }) {
	return (
		<li>
			<button className={styles.listColorPickerItemLink}>
				<div
					className={styles.listColorPickerItem}
					style={{ backgroundColor: color }}
				></div>
			</button>
		</li>
	);
}

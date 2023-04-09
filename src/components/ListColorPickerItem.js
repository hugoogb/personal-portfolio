import styles from "../styles/ColorPicker.module.css";

export function ListColorPickerItem({ color }) {
	return (
		<li>
			<a className={styles.listColorPickerItemLink}>
				<div
					className={styles.listColorPickerItem}
					style={{ backgroundColor: color }}
				></div>
			</a>
		</li>
	);
}

import styles from "../styles/ColorPicker.module.css";

export function ListColorPickerItem({ color }) {
	return (
		<li className={styles.listColorPickerItem}>
			<a>{color}</a>
		</li>
	);
}

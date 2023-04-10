import styles from "../styles/ColorPicker.module.css";

export function ListColorPickerItem({ color, onClick }) {
	return (
		<li>
			<button
				className={styles.listColorPickerItemLink}
				onClick={() => onClick(color)}
			>
				<div
					className={styles.listColorPickerItem}
					style={{ backgroundColor: color }}
				></div>
			</button>
		</li>
	);
}

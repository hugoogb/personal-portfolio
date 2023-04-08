export function ListColorPickerItem({ color }) {
	return (
		<li className={styles.listColorPickerItem}>
			<a>{color}</a>
		</li>
	);
}

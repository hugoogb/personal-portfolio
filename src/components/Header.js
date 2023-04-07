import styles from "../styles/Header.module.css";

export function Header() {
	const name = "Hugo García Benjumea";

	return (
		<header>
			<h1 className={styles.nameHeader}>{name}</h1>
		</header>
	);
}

import styles from "../styles/Navbar.module.css";

export function Navbar() {
	return (
		<nav>
			<ul className={styles.ulNavbar}>
				<li>Home</li>
				<li>About</li>
				<li>Projects</li>
				<li>Contact</li>
			</ul>
		</nav>
	);
}

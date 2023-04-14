import styles from "../styles/Navbar.module.css";
import { ColorPicker } from "./ColorPicker";

export function Navbar({ setColor }) {
	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<ul className={styles.ulNavbar}>
					<li>Home</li>
					<li>About</li>
					<li>Projects</li>
					<li>Contact</li>
				</ul>
				<ColorPicker setColor={setColor}></ColorPicker>
			</div>
		</nav>
	);
}

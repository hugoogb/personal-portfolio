import styles from "../styles/modules/Navbar.module.css";
import { ColorPicker } from "./ColorPicker";
import { Logo } from "./Logo";

export function Navbar({ setColor }) {
	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<Logo end={false}></Logo>
				<ul className={styles.ulNavbar}>
					<li>Home</li>
					<li>About</li>
					<li>Projects</li>
					<li>Contact</li>
				</ul>
				<Logo end={true}></Logo>
			</div>
			<ColorPicker setColor={setColor}></ColorPicker>
		</nav>
	);
}

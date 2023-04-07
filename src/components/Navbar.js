import styles from "../styles/Navbar.module.css";
import Image from "next/image";
import imageTest from "../../assets/images/image.jpeg";

export function Navbar() {
	return (
		<nav className={styles.navbar}>
			<div className={styles.logoNavbar}>
				<Image src={imageTest} alt='Logo img test' width={100}></Image>
			</div>
			<ul className={styles.ulNavbar}>
				<li>Home</li>
				<li>About</li>
				<li>Projects</li>
				<li>Contact</li>
			</ul>
		</nav>
	);
}

import styles from "@/styles/modules/Header.module.css";
import { Navbar } from "@/components/header/navbar/Navbar.jsx";

export const Header = ({ setColor }) => {
	return (
		<header className={styles.header}>
			<div className={styles.headerAbsolute}>
				<div className={styles.headerWrapper}>
					<Navbar setColor={setColor}></Navbar>
				</div>
			</div>
		</header>
	);
};

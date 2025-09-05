import styles from "@/styles/modules/Header.module.css";
import { Navbar } from "@/components/header/navbar/Navbar";

export const Header = () => {
	return (
		<header className={styles.header}>
			<div className={styles.headerAbsolute}>
				<div className={styles.headerWrapper}>
					<Navbar />
				</div>
			</div>
		</header>
	);
};

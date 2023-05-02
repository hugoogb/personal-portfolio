import { useState, useEffect } from "react";
import styles from "@/styles/modules/DarkModeToggle.module.css";

export const DarkModeToggle = () => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const isDarkModeEnabled = localStorage.getItem("isDarkMode") === "true";
		setIsDarkMode(isDarkModeEnabled);

		// Add the appropriate theme class based on the initial state
		if (isDarkModeEnabled) {
			document.body.classList.add("dark-theme");
		} else {
			document.body.classList.add("light-theme");
		}
	}, []);

	const toggleDarkMode = () => {
		const newIsDarkMode = !isDarkMode;
		setIsDarkMode(newIsDarkMode);
		localStorage.setItem("isDarkMode", newIsDarkMode);

		// Remove the old theme class and add the new one based on the new state
		if (newIsDarkMode) {
			document.body.classList.remove("light-theme");
			document.body.classList.add("dark-theme");
		} else {
			document.body.classList.remove("dark-theme");
			document.body.classList.add("light-theme");
		}
	};

	return (
		<div className={styles.toggleWrapper}>
			<input
				type='checkbox'
				id='dn'
				checked={isDarkMode}
				onChange={toggleDarkMode}
			/>
			<label htmlFor='dn' className={styles.toggle}>
				<span className={styles.toggle__handler}>
					<span
						className={`${styles.crater} ${styles.crater_1}`}
					></span>
					<span
						className={`${styles.crater} ${styles.crater_2}`}
					></span>
					<span
						className={`${styles.crater} ${styles.crater_3}`}
					></span>
				</span>
				<span className={`${styles.star} ${styles.star_1}`}></span>
				<span className={`${styles.star} ${styles.star_2}`}></span>
				<span className={`${styles.star} ${styles.star_3}`}></span>
				<span className={`${styles.star} ${styles.star_4}`}></span>
				<span className={`${styles.star} ${styles.star_5}`}></span>
				<span className={`${styles.star} ${styles.star_6}`}></span>
			</label>
		</div>
	);
};

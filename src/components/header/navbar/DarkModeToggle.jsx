import { useState, useEffect } from "react";
import styles from "@/styles/modules/Settings.module.css";

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
		<button className='button' onClick={toggleDarkMode}>
			{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
		</button>
	);
};

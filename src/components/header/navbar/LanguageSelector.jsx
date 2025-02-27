import { useEffect, useState, useContext, useCallback } from "react";
import Image from "next/image";
import styles from "@/styles/modules/Settings.module.css";
import i18n from "../../../../i18n.js";
import { ColorContext } from "@/components/Layout.jsx";

const languageOptions = [
	{ code: "en", label: "English", flag: "/flags/en.png" },
	{ code: "es", label: "Español", flag: "/flags/es.svg" },
	{ code: "ca", label: "Català", flag: "/flags/ca.svg" },
];

export const LanguageSelector = () => {
	const [currentLanguage, setCurrentLanguage] = useState("en");
	const { color } = useContext(ColorContext);

	// Function to load locale dynamically
	const loadLocale = useCallback(async (locale) => {
		try {
			const translations = await import(`../../../../i18n/${locale}.json`);
			i18n.addResourceBundle(locale, 'common', translations.default);
		} catch (error) {
			console.error(`Failed to load locale ${locale}:`, error);
		}
	}, []);

	const changeLanguage = useCallback(async (lng) => {
		try {
			// Load the language file if not already loaded
			if (!i18n.hasResourceBundle(lng, 'common')) {
				await loadLocale(lng);
			}
			
			// Change the language
			await i18n.changeLanguage(lng);
			
			// Save to localStorage
			localStorage.setItem("language", lng);
			
			// Update state
			setCurrentLanguage(lng);
		} catch (error) {
			console.error("Error changing language:", error);
		}
	}, [loadLocale]);

	useEffect(() => {
		// Set initial language from localStorage or i18n
		const savedLanguage = localStorage.getItem("language") || i18n.language;
		setCurrentLanguage(savedLanguage);
		
		// Make sure i18n is using the correct language
		if (savedLanguage !== i18n.language) {
			changeLanguage(savedLanguage);
		}
	}, [changeLanguage]);

	return (
		<div className={styles.languageSelectorContainer}>
			{languageOptions.map(({ code, label, flag }) => (
				<button
					key={code}
					className={styles.languageSelectorButton}
					style={
						currentLanguage === code
							? { borderColor: color }
							: { borderColor: "transparent" }
					}
					onClick={() => changeLanguage(code)}
				>
					<Image
						src={flag}
						alt={label + " circular flag"}
						width={24}
						height={24}
					/>
					<span
						style={
							currentLanguage === code
								? { fontWeight: "600" }
								: {}
						}
						className={styles.languageSelectorButtonLabel}
					>
						{label}
					</span>
				</button>
			))}
		</div>
	);
};

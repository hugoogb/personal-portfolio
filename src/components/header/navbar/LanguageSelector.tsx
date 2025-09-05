import type { FC } from 'react';
import { useEffect, useState, useContext, useCallback } from 'react';
import Image from "next/image";
import styles from "@/styles/modules/Settings.module.css";
import i18n from "../../../../i18n";
import { ColorContext } from "@/components/Layout";
import type { SupportedLocale } from "@/types/i18n.types";

const languageOptions = [
	{ code: "en" as const, label: "English", flag: "/flags/en.png" },
	{ code: "es" as const, label: "Español", flag: "/flags/es.svg" },
	{ code: "ca" as const, label: "Català", flag: "/flags/ca.svg" },
];

export const LanguageSelector: FC = () => {
	const [currentLanguage, setCurrentLanguage] = useState<SupportedLocale>("en");
	const { color } = useContext(ColorContext);

	// Function to load locale dynamically
	const loadLocale = useCallback(async (locale: SupportedLocale) => {
		try {
			const translations = await import(`../../../../i18n/${locale}.json`);
			i18n.addResourceBundle(locale, 'common', translations.default);
		} catch (error) {
			console.error(`Failed to load locale ${locale}:`, error);
		}
	}, []);

	const changeLanguage = useCallback(async (lng: SupportedLocale) => {
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
		const validLanguage = ['en', 'es', 'ca'].includes(savedLanguage) 
			? (savedLanguage as SupportedLocale) 
			: 'en';
		
		setCurrentLanguage(validLanguage);
		
		// Make sure i18n is using the correct language
		if (validLanguage !== i18n.language) {
			changeLanguage(validLanguage);
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

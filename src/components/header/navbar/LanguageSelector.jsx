import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/PortfolioLayout";

const languageOptions = [
	{ code: "en", label: "English", flag: "/flags/en.png" },
	{ code: "es", label: "Español", flag: "/flags/es.svg" },
	{ code: "ca", label: "Català", flag: "/flags/ca.svg" },
];

export const LanguageSelector = () => {
	const { i18n } = useTranslation();
	const color = useContext(ColorContext);
	const [selectedLanguage, setSelectedLanguage] = useState(
		i18n.resolvedLanguage
	);

	useEffect(() => {
		const savedLanguage = localStorage.getItem("language");
		if (
			savedLanguage &&
			languageOptions.some(({ code }) => code === savedLanguage)
		) {
			i18n.changeLanguage(savedLanguage);
			setSelectedLanguage(savedLanguage);
		}
	}, [i18n]);

	function handleLanguageChange(newLanguage) {
		i18n.changeLanguage(newLanguage);
		setSelectedLanguage(newLanguage);
		localStorage.setItem("language", newLanguage);
	}

	return (
		<div className={styles.languageSelectorContainer}>
			{languageOptions.map(({ code, label, flag }) => (
				<button
					key={code}
					className={styles.languageSelectorButton}
					style={
						selectedLanguage === code
							? { borderColor: color }
							: { borderColor: "transparent" }
					}
					onClick={() => handleLanguageChange(code)}
				>
					<Image
						src={flag}
						alt={label + " circular flag"}
						width={24}
						height={24}
					/>
					<span
						style={
							selectedLanguage === code
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

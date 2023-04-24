import { useContext } from "react";
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

	function handleLanguageChange(newLanguage) {
		i18n.changeLanguage(newLanguage);
	}

	return (
		<div className={styles.languageSelectorContainer}>
			{languageOptions.map(({ code, label, flag }) => (
				<button
					key={code}
					className={styles.languageSelectorButton}
					style={
						i18n.resolvedLanguage === code
							? { borderColor: color }
							: { borderColor: "black" }
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
							i18n.resolvedLanguage === code
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

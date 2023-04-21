import { useTranslation } from "react-i18next";

export const LanguageSelector = () => {
	const { i18n } = useTranslation();

	function handleLanguageChange(event) {
		const newLanguage = event.target.value;
		i18n.changeLanguage(newLanguage);
	}

	return (
		<select onChange={handleLanguageChange} value={i18n.language}>
			<option value='en'>English</option>
			<option value='es'>Español</option>
			<option value='ca'>Català</option>
		</select>
	);
};

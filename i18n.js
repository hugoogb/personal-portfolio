import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";
import caTranslation from "./locales/ca.json";

i18n.use(initReactI18next).init({
	lng: "en",
	fallbackLng: "en",
	// debug: true,
	resources: {
		en: {
			translation: enTranslation,
		},
		es: {
			translation: esTranslation,
		},
		ca: {
			translation: caTranslation,
		},
	},
});

export default i18n;

import { Html, Head, Main, NextScript } from "next/document";
import i18n from "../../i18n.js";

export default function Document() {
	return (
		<Html lang={i18n.resolvedLanguage}>
			<Head />
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

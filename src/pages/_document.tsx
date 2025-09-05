import { Html, Head, Main, NextScript } from "next/document";
import i18n from "../../i18n";

export default function Document() {
	return (
		<Html lang={i18n.resolvedLanguage || 'en'}>
			<Head>
				<meta name="theme-color" content="#3142db" />
				<meta name="color-scheme" content="light dark" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

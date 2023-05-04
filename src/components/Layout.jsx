import { createContext, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.js";
import { Header } from "@/components/header/Header.jsx";
import { Footer } from "@/components/footer/Footer.jsx";

export const ColorContext = createContext("#3142db");

export const Layout = ({ children }) => {
	const [color, setColor] = useState("#3142db");

	return (
		<I18nextProvider i18n={i18n}>
			<ColorContext.Provider value={color}>
				<Header setColor={setColor}></Header>
				{children}
				<Footer></Footer>
			</ColorContext.Provider>
		</I18nextProvider>
	);
};

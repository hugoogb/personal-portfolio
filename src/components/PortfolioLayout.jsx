import { createContext, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.js";
import { Navbar } from "@/components/navbar/Navbar.jsx";
import { HomeSection } from "@/components/sections/home/HomeSection.jsx";
import { AboutSection } from "@/components/sections/about/AboutSection.jsx";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection.jsx";
import { ContactSection } from "@/components/sections/contact/ContactSection.jsx";
import { Footer } from "@/components/footer/Footer.jsx";

export const ColorContext = createContext("#ff5400");

export function PortfolioLayout() {
	const [color, setColor] = useState("#ff5400");

	return (
		<I18nextProvider i18n={i18n}>
			<ColorContext.Provider value={color}>
				<Navbar setColor={setColor}></Navbar>
				<HomeSection></HomeSection>
				<AboutSection></AboutSection>
				<ProjectsSection></ProjectsSection>
				<ContactSection></ContactSection>
				<Footer></Footer>
			</ColorContext.Provider>
		</I18nextProvider>
	);
}

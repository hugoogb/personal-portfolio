import { Navbar } from "../components/Navbar.js";
import { HomeSection } from "./sections/HomeSection.js";
import { AboutSection } from "./sections/AboutSection.js";
import { ProjectsSection } from "./sections/ProjectsSection.js";
import { ContactSection } from "./sections/ContactSection.js";
import { Footer } from "./Footer.js";
import { createContext, useState } from "react";

export const ColorContext = createContext("#000");

export function PortfolioLayout() {
	const [color, setColor] = useState("#000");

	return (
		<>
			<ColorContext.Provider value={color}>
				<Navbar setColor={setColor}></Navbar>
				<HomeSection></HomeSection>
				<AboutSection></AboutSection>
				<ProjectsSection></ProjectsSection>
				<ContactSection></ContactSection>
				<Footer></Footer>
			</ColorContext.Provider>
		</>
	);
}

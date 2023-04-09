// import { Navbar } from "../components/Navbar.js";
import { ColorPicker } from "./ColorPicker.js";
import { Header } from "./Header.js";
import { HomeSection } from "./HomeSection.js";
import { AboutSection } from "./AboutSection.js";
import { ProjectsSection } from "./ProjectsSection.js";
import { ContactSection } from "./ContactSection.js";
import { Footer } from "./Footer.js";
import { createContext, useState } from "react";

export const ThemeContext = createContext("#ffffff");

export function PortfolioLayout() {
	const [theme, setTheme] = useState("#ffffff");

	return (
		<>
			<ColorPicker
				onClick={(color) => {
					setTheme(color);
				}}
			></ColorPicker>
			<ThemeContext.Provider value={theme}>
				{/* <Navbar></Navbar> */}
				<Header></Header>
				<HomeSection></HomeSection>
				<AboutSection></AboutSection>
				<ProjectsSection></ProjectsSection>
				<ContactSection></ContactSection>
				<Footer></Footer>
			</ThemeContext.Provider>
		</>
	);
}

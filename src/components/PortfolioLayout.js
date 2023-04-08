// import { Navbar } from "../components/Navbar.js";
import { ColorPicker } from "./ColorPicker.js";
import { Header } from "./Header.js";
import { HomeSection } from "./HomeSection.js";
import { AboutSection } from "./AboutSection.js";
import { ProjectsSection } from "./ProjectsSection.js";
import { ContactSection } from "./ContactSection.js";
import { Footer } from "./Footer.js";

export function PortfolioLayout() {
	return (
		<>
			{/* <Navbar></Navbar> */}
			<ColorPicker></ColorPicker>
			<Header></Header>
			<HomeSection></HomeSection>
			<AboutSection></AboutSection>
			<ProjectsSection></ProjectsSection>
			<ContactSection></ContactSection>
			<Footer></Footer>
		</>
	);
}

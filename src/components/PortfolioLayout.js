import { Navbar } from "../components/Navbar.js";
import { ProjectsSection } from "./ProjectsSection.js";
import { HomeSection } from "./HomeSection.js";
import { AboutSection } from "./AboutSection.js";
import { ContactSection } from "./ContactSection.js";

export function PortfolioLayout() {
	return (
		<main>
			<Navbar></Navbar>
			{/* HEADER ??? */}
			<HomeSection></HomeSection>
			<AboutSection></AboutSection>
			<ProjectsSection></ProjectsSection>
			<ContactSection></ContactSection>
			{/* FOOTER ??? */}
		</main>
	);
}

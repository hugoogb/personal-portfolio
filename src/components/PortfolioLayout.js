import { Navbar } from "../components/Navbar.js";
import { ProjectsSection } from "./ProjectsSection.js";

export function PortfolioLayout() {
	return (
		<main>
			<Navbar></Navbar>
			<ProjectsSection></ProjectsSection>
		</main>
	);
}

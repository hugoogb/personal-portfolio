import { Project } from "../Project.js";
import styles from "../../styles/modules/Section.module.css";
import stylesProject from "../../styles/modules/Projects.module.css";
import imageTest from "../../../public/image.jpeg";
import { SectionTitle } from "./SectionTitle.js";

export function ProjectsSection() {
	const projects = [
		{
			id: 0,
			name: "Formula 1 Showcase",
			desc: "Showcase information retrieved with F1 API created",
			urlPreview: "https://f1-showcase.vercel.app",
			imgSrc: imageTest,
			imgAlt: "Image test",
		},
		{
			id: 1,
			name: "Formula 1 API",
			desc: "API with expressjs done scrapping F1 site with cheerio",
			urlPreview: "https://f1-api.vercel.app",
			imgSrc: imageTest,
			imgAlt: "Image test",
		},
	];

	const projectsMapped = projects.map((project) => {
		return (
			<Project
				key={project.id}
				name={project.name}
				desc={project.desc}
				urlPreview={project.urlPreview}
				imgSrc={project.imgSrc}
				imgAlt={project.imgAlt}
			></Project>
		);
	});

	return (
		<>
			<section id='projects' className={styles.section}>
				<SectionTitle>Projects</SectionTitle>
				<div className={stylesProject.projectsWrapper}>
					{projectsMapped}
				</div>
			</section>
		</>
	);
}

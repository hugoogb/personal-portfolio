import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Projects.module.css";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { Project } from "@/components/sections/projects/Project.jsx";
import imageTest from "/public/image.jpeg";
import memoji from "/public/memojis/image2.png";

export function ProjectsSection() {
	const { t } = useTranslation();

	const projects = [
		{
			id: 0,
			name: "Formula 1 Showcase",
			desc: t("projects.formula1Showcase.description"),
			urlPreview: "https://f1-showcase.vercel.app",
			imgSrc: imageTest,
			imgAlt: t("projects.formula1Showcase.imgAlt"),
		},
		{
			id: 1,
			name: "Formula 1 API",
			desc: t("projects.formula1API.description"),
			urlPreview: "https://f1-api.vercel.app",
			imgSrc: imageTest,
			imgAlt: t("projects.formula1API.imgAlt"),
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
		<section id={t("nav.projects")} className='section'>
			<div className='cardWrapper'>
				<div className='cardContainer'>
					<div className='sectionWrapper'>
						<SectionTitle memoji={memoji}>
							{t("projects.title")}
						</SectionTitle>
						<div className={styles.projectsWrapper}>
							{projectsMapped}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

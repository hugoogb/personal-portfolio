import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Section.module.css";
import stylesProject from "@/styles/modules/Projects.module.css";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { Project } from "@/components/sections/projects/Project.jsx";
import imageTest from "../../../../public/image.jpeg";

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
		<section id={t("nav.projects")} className={styles.section}>
			<SectionTitle>{t("projects.title")}</SectionTitle>
			<div className={stylesProject.projectsWrapper}>
				{projectsMapped}
			</div>
		</section>
	);
}

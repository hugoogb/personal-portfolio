import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project.jsx";
import memoji from "/public/memojis/image2.png";
import { SectionCard } from "@/components/sections/SectionCard.jsx";

export function ProjectsSection() {
	const { t } = useTranslation();

	const projects = [
		{
			id: 0,
			name: "Formula 1 Showcase",
			desc: t("projects.formula1Showcase.description"),
			urlPreview: "https://f1-showcase.vercel.app",
		},
		{
			id: 1,
			name: "Formula 1 API",
			desc: t("projects.formula1API.description"),
			urlPreview: "https://f1-api.vercel.app",
		},
		{
			id: 2,
			name: "Personal portfolio",
			desc: t("projects.personalPortfolio.description"),
			urlPreview: "https://hugoogb.dev",
		},
	];

	const projectsMapped = projects.map((project) => {
		return (
			<Project
				key={project.id}
				name={project.name}
				desc={project.desc}
				urlPreview={project.urlPreview}
			></Project>
		);
	});

	return (
		<SectionCard
			id={t("nav.projects")}
			title={t("projects.title")}
			memoji={memoji}
		>
			<div className={styles.projectsWrapper}>{projectsMapped}</div>
		</SectionCard>
	);
}

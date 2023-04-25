import { useContext } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/About.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { AboutIcons } from "@/components/sections/about/AboutIcons.jsx";
import memoji from "/public/memojis/image4.png";
import { SectionCard } from "../SectionCard";

export function AboutSection() {
	const { t } = useTranslation();

	const color = useContext(ColorContext);

	const iconsFrontend = [
		{
			id: 0,
			src: "/icons/html-5.svg",
			alt: "HTML",
		},
		{
			id: 1,
			src: "/icons/css3.svg",
			alt: "CSS3 svg icon",
		},
		{
			id: 2,
			src: "/icons/javascript.svg",
			alt: "Javascript",
		},
		{
			id: 3,
			src: "/icons/reactjs.svg",
			alt: "Reactjs",
		},
		{
			id: 4,
			src: "/icons/vuejs.svg",
			alt: "Vuejs",
		},
	];

	const iconsBackend = [
		{
			id: 5,
			src: "/icons/nextjs.svg",
			alt: "Nextjs",
		},
		{
			id: 6,
			src: "/icons/nodejs.svg",
			alt: "Nodejs",
		},
		{
			id: 7,
			src: "/icons/expressjs.svg",
			alt: "Expressjs",
		},
		{
			id: 8,
			src: "/icons/firebase.svg",
			alt: "Firebase",
		},
	];

	const iconsTools = [
		{
			id: 9,
			src: "/icons/npm.svg",
			alt: "Npm",
		},
		{
			id: 10,
			src: "/icons/git.svg",
			alt: "Git",
		},
		{
			id: 11,
			src: "/icons/github.svg",
			alt: "GitHub",
		},
	];

	const iconsFrontendMapped = iconsFrontend.map((icon) => {
		return (
			<Image
				key={icon.id}
				src={icon.src}
				alt={icon.alt + " svg icon"}
				width={48}
				height={48}
				className={styles.aboutIcon}
			/>
		);
	});

	const iconsBackendMapped = iconsBackend.map((icon) => {
		return (
			<Image
				key={icon.id}
				src={icon.src}
				alt={icon.alt + " svg icon"}
				width={48}
				height={48}
				className={styles.aboutIcon}
			/>
		);
	});

	const iconsToolsMapped = iconsTools.map((icon) => {
		return (
			<Image
				key={icon.id}
				src={icon.src}
				alt={icon.alt + " svg icon"}
				width={48}
				height={48}
				className={styles.aboutIcon}
			/>
		);
	});

	return (
		<SectionCard
			id={t("nav.about")}
			title={t("about.title")}
			memoji={memoji}
		>
			<div className={styles.aboutContainer}>
				<div className={styles.aboutTextContainer}>
					<p>
						{t("about.text.intro")}
						<span className={styles.aboutTextName}>
							{t("about.text.name")}
						</span>
						{t("about.text.introNext")}
						<span style={{ color: color }}>
							{t("about.text.webDeveloper")}
						</span>
						{t("about.text.mainFocus")}
						<span style={{ color: color }}>
							{t("about.text.webApps")}
						</span>
						{t("about.text.butAlso")}
						<span style={{ color: color }}>
							{t("about.text.mobileApps")}
						</span>
						{t("about.text.using")}
						<span style={{ color: color }}>
							{t("about.text.ReactNative")}
						</span>
						{t("about.text.endIntro")}
					</p>
					<br></br>
					<p>
						{t("about.text.specializeIn")}
						<span style={{ color: color }}>
							{t("about.text.jsFrameworks")}
						</span>
						{t("about.text.suchAs")}
						<span style={{ color: color }}>
							{t("about.text.react")}
						</span>
						{t("about.text.and")}
						<span style={{ color: color }}>
							{t("about.text.vue")}
						</span>
						{t("about.text.forFrontendDev")}
						<span style={{ color: color }}>
							{t("about.text.responsive")}
						</span>
						{t("about.text.and")}
						<span style={{ color: color }}>
							{t("about.text.dynamic")}
						</span>
						{t("about.text.userInterfaces")}
						<span style={{ color: color }}>
							{t("about.text.simpleLandingPage")}
						</span>
						{t("about.text.orA")}
						<span style={{ color: color }}>
							{t("about.text.complexWebApp")}
						</span>
						{t("about.text.iTakePrideIn")}
					</p>
					<br></br>
					<p>
						{t("about.text.inAdditionTo")}
						<span style={{ color: color }}>
							{t("about.text.nodeJs")}
						</span>
						{t("about.text.technologiesSuchAs")}
						<span style={{ color: color }}>
							{t("about.text.ExpressJS")}
						</span>
						{t("about.text.robustApps")}
					</p>
				</div>
				<div className={styles.aboutImagesContainer}>
					<AboutIcons
						title={t("about.categories.frontend")}
						iconsMapped={iconsFrontendMapped}
						color={color}
					></AboutIcons>
					<AboutIcons
						title={t("about.categories.backend")}
						iconsMapped={iconsBackendMapped}
						color={color}
					></AboutIcons>
					<AboutIcons
						title={t("about.categories.tools")}
						iconsMapped={iconsToolsMapped}
						color={color}
					></AboutIcons>
				</div>
			</div>
		</SectionCard>
	);
}

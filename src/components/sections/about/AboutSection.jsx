import { useContext } from "react";
import Image from "next/image";
import sectionStyles from "@/styles/modules/Section.module.css";
import styles from "@/styles/modules/About.module.css";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { AboutIcons } from "@/components/sections/about/AboutIcons.jsx";

export function AboutSection() {
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
		<section id='about' className={sectionStyles.section}>
			<SectionTitle>About</SectionTitle>
			<div className={styles.aboutContainer}>
				<div className={styles.aboutTextContainer}>
					<p>
						Hey there! My name is Hugo and I{"'"}m a{" "}
						<span style={{ color: color }}>web developer</span>. My
						main focus is developing{" "}
						<span style={{ color: color }}>web applications</span>{" "}
						but I also develop{" "}
						<span style={{ color: color }}>mobile apps</span> using{" "}
						<span style={{ color: color }}>React Native</span>.
					</p>
					<br></br>
					<p>
						I specialize in using{" "}
						<span style={{ color: color }}>
							Javascript frameworks
						</span>{" "}
						such as <span style={{ color: color }}>React</span> and{" "}
						<span style={{ color: color }}>Vue </span>for frontend
						development. I love the challenge of creating{" "}
						<span style={{ color: color }}>responsive</span> and{" "}
						<span style={{ color: color }}>dynamic</span> user
						interfaces that enhance the user experience. Whether it
						{"'"}s a{" "}
						<span style={{ color: color }}>
							simple landing page
						</span>{" "}
						or a a{" "}
						<span style={{ color: color }}>
							complex web application
						</span>
						, I take pride in crafting visually appealing and
						intuitive designs that meet my clients{"'"} needs.
					</p>
					<br></br>
					<p>
						In addition to frontend development, I also have
						knowledge of backend{" "}
						<span style={{ color: color }}>Nodejs</span>{" "}
						technologies such as{" "}
						<span style={{ color: color }}>ExpressJS</span>. This
						allows me to create robust and scalable applications.
					</p>
				</div>
				<div className={styles.aboutImagesContainer}>
					<AboutIcons
						title={"Frontend"}
						iconsMapped={iconsFrontendMapped}
						color={color}
					></AboutIcons>
					<AboutIcons
						title={"Backend"}
						iconsMapped={iconsBackendMapped}
						color={color}
					></AboutIcons>
					<AboutIcons
						title={"Tools"}
						iconsMapped={iconsToolsMapped}
						color={color}
					></AboutIcons>
				</div>
			</div>
		</section>
	);
}

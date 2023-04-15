import sectionStyles from "../../styles/modules/Section.module.css";
import styles from "../../styles/modules/About.module.css";
import { SectionTitle } from "./SectionTitle.js";
import { useContext } from "react";
import { ColorContext } from "../PortfolioLayout";

export function AboutSection() {
	const color = useContext(ColorContext);

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
					<p>Some svgs regarding frameworks ...</p>
				</div>
			</div>
		</section>
	);
}

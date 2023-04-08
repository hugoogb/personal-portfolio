import Image from "next/image";
import styles from "../styles/Projects.module.css";

export function Project({ name, desc, urlPreview, imgSrc, imgAlt }) {
	return (
		<a href={urlPreview} target='_blank' className={styles.projectLink}>
			<div className={styles.projectContainer}>
				<h3 className={styles.projectTitle}>{name}</h3>
				<Image
					src={imgSrc}
					alt={imgAlt}
					width={500}
					className={styles.projectImage}
				></Image>
				<p className={styles.projectDesc}>{desc}</p>
			</div>
		</a>
	);
}

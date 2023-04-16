import Image from "next/image";
import styles from "../styles/modules/Projects.module.css";

export function Project({ name, desc, urlPreview, imgSrc, imgAlt }) {
	return (
		<a href={urlPreview} target='_blank' className={styles.projectLink}>
			<div className={styles.projectContainer}>
				<h3 className={styles.projectTitle}>{name}</h3>
				<div className={styles.projectImageContainer}>
					<Image
						src={imgSrc}
						alt={imgAlt}
						fill={true}
						className={styles.projectImage}
					></Image>
				</div>
				<p className={styles.projectDesc}>{desc}</p>
			</div>
		</a>
	);
}

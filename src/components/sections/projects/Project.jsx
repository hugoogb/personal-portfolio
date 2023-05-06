import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";

export function Project({ name, desc, urlPreview, src }) {
	const { t } = useTranslation();

	return (
		<a href={urlPreview} target='_blank' className={styles.projectLink}>
			<div className={styles.projectContainer}>
				<h3 className={styles.projectTitle}>{name}</h3>
				<div
					className={`imageContainer ${styles.projectImageContainer}`}
				>
					<Image
						src={src}
						alt={`${name} ${t("projects.alt")}`}
						fill={true}
						className={`image ${styles.projectImage}`}
						unoptimized={true}
					></Image>
				</div>
				<p className={styles.projectDesc}>{desc}</p>
			</div>
		</a>
	);
}

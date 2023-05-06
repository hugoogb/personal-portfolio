import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";

export function Project({ name, desc, urlPreview, src }) {
	const { t } = useTranslation();

	return (
		<a href={urlPreview} target='_blank' className={styles.projectLink}>
			<div className={styles.projectContainer}>
				<h3 className={styles.projectTitle}>{name}</h3>
				<Image
					src={src}
					alt={`${name} ${t("projects.alt")}`}
					width={500}
					height={300}
					className={styles.projectImage}
					unoptimized={true}
				></Image>
				<p className={styles.projectDesc}>{desc}</p>
			</div>
		</a>
	);
}

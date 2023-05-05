import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";
import { useEffect, useState } from "react";

export function Project({ name, desc, urlPreview }) {
	const { t } = useTranslation();

	const [screenshot, setScreenshot] = useState("");

	useEffect(() => {
		async function loadScreenshot() {
			const response = await fetch(
				`/api/screenshot?url=${encodeURIComponent(urlPreview)}`
			);
			const screenshotBlob = await response.blob();
			const screenshotUrl = URL.createObjectURL(screenshotBlob);
			setScreenshot(screenshotUrl);
		}

		loadScreenshot();
	}, [urlPreview]);

	return (
		<a href={urlPreview} target='_blank' className={styles.projectLink}>
			<div className={styles.projectContainer}>
				<h3 className={styles.projectTitle}>{name}</h3>
				{screenshot === "" ? (
					<p>Loading preview image...</p>
				) : (
					<Image
						src={screenshot}
						alt={`${name} ${t("projects.alt")}`}
						width={500}
						height={300}
						className={styles.projectImage}
					></Image>
				)}
				<p className={styles.projectDesc}>{desc}</p>
			</div>
		</a>
	);
}

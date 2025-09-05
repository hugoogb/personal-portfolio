import styles from "@/styles/modules/About.module.css";

interface AboutIconsProps {
  title: any;
  iconsMapped: any;
  color: any;
}

export const AboutIcons: FC<AboutIconsProps> = ({ title, iconsMapped, color  }) => {
	return (
		<div className={styles.aboutIconsTitleWrapper}>
			<span style={{ backgroundColor: color }}></span>
			<div className={styles.aboutIconsTitleContainer}>
				<h3 className={styles.aboutIconsTitle}>{title}</h3>
				<div className={styles.aboutIconsContainer}>{iconsMapped}</div>
			</div>
		</div>
	);
};

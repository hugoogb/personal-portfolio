import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";

export function ProjectTechStack({ title, icons }) {
  return (
    <div>
      <h5>{title}</h5>
      <div className={styles.projectTechStackIconsWrapper}>
        {icons.map((icon, index) => (
          <div key={index} className={styles.projectTechIcon}>
            {icon.src && (
              <Image
                src={`/icons/${icon.src}`}
                alt={icon.alt}
                width={24}
                height={24}
              />
            )}
            <span>{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
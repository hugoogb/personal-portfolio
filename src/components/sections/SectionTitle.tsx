import Image from "next/image";
import type { ReactNode } from "react";
import { useContext } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { ColorContext } from "@/components/Layout";
import styles from "@/styles/modules/Section.module.css";
import { ICON_SIZES } from "@/constants/design.constants";
import { ALT_TEXT } from "@/constants/strings.constants";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

interface SectionTitleProps {
  memoji: string;
  children: ReactNode;
}

export const SectionTitle = ({ memoji, children }: SectionTitleProps) => {
  const { color } = useContext(ColorContext);

  return (
    <div className={hankenGrotesk.className}>
      <div className={styles.sectionTitleContainer}>
        <Image
          src={memoji}
          alt={ALT_TEXT.SECTION(String(children))}
          width={ICON_SIZES.xl}
          height={ICON_SIZES.xl}
        />
        <h2 className={styles.sectionTitle} style={{ color: color }}>
          {children}
        </h2>
      </div>
    </div>
  );
};

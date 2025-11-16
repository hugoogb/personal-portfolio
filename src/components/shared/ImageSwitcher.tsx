import type { FC } from "react";
import { useState } from "react";
import Image from "next/image";
import { IconRefresh } from "@tabler/icons-react";
import { ICON_SIZES, IMAGE_SIZES } from "@/constants/design.constants";
import { ALT_TEXT } from "@/constants/strings.constants";
import styles from "@/styles/modules/Home.module.css";

interface ImageSwitcherProps {
  images: string[];
  backgroundColor: string;
  altText?: string;
}

export const ImageSwitcher: FC<ImageSwitcherProps> = ({
  images,
  backgroundColor,
  altText = ALT_TEXT.PROFILE,
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);

  const toggleImage = () => {
    setActiveImage((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div
      style={{ background: backgroundColor }}
      className={`imageContainer ${styles.profileImageBackground}`}
    >
      <Image
        src={images[activeImage]}
        alt={altText}
        fill={true}
        sizes={`(max-width: 720px) ${IMAGE_SIZES.profile.mobile}px, (max-width: 920px) ${IMAGE_SIZES.profile.tablet}px, ${IMAGE_SIZES.profile.desktop}px`}
        priority={true}
        className={`image ${styles.profileImage}`}
      />
      <div className={styles.iconChangeImage}>
        <button
          className="button"
          onClick={toggleImage}
          aria-label="Switch profile image"
        >
          <IconRefresh size={ICON_SIZES.md} />
        </button>
      </div>
    </div>
  );
};

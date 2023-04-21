import { useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Navbar.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";

export const ButtonCV = ({ downloadUrl, fileName }) => {
	const { t } = useTranslation();

	const color = useContext(ColorContext);

	const elementRef = useRef(null);

	useEffect(() => {
		const element = elementRef.current;
		const bgColor = getComputedStyle(element).backgroundColor;
		const rgbValues = bgColor
			.substring(bgColor.indexOf("(") + 1, bgColor.lastIndexOf(")"))
			.split(/,\s*/);
		const red = parseInt(rgbValues[0]);
		const green = parseInt(rgbValues[1]);
		const blue = parseInt(rgbValues[2]);
		const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

		if (luminance > 0.5) {
			element.style.color = "black";
		} else {
			element.style.color = "white";
		}
	}, [color]);

	const handleDownload = async () => {
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<button
			ref={elementRef}
			onClick={handleDownload}
			style={{ backgroundColor: color }}
			className={styles.buttonCV}
		>
			{t("nav.downloadButton")}
		</button>
	);
};

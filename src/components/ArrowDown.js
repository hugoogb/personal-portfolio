import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";
import styles from "../styles/modules/Section.module.css";
import { useContext } from "react";
import { ColorContext } from "./PortfolioLayout";

export const ArrowDown = ({ nextSection }) => {
	const color = useContext(ColorContext);

	return (
		<div className={styles.arrowDownIconContainer}>
			<a
				href={"#" + nextSection}
				style={{ backgroundColor: color }}
				className={styles.arrowDownIconLink}
			>
				<ChevronDoubleDownIcon
					className={styles.arrowDownIcon}
				></ChevronDoubleDownIcon>
			</a>
		</div>
	);
};

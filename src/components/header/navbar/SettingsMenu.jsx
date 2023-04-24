import { useContext, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/modules/Settings.module.css";
import { ColorContext } from "@/components/PortfolioLayout.jsx";
import { LanguageSelector } from "@/components/header/navbar/LanguageSelector.jsx";

export function SettingsMenu({ setColor }) {
	const color = useContext(ColorContext);
	const [display, setDisplay] = useState("");
	const [visibility, setVisibility] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width <= 720) {
				setDisplay("mobile");
			} else {
				setDisplay("desktop");
			}
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const settingsWrapperStyles = Object.assign(
		{},
		{
			height:
				display === "mobile"
					? visibility
						? "457px"
						: "0"
					: visibility
					? "337px"
					: "0",
		},
		{ overflow: visibility ? "auto" : "hidden" }
	);

	return (
		<div className={styles.settingsMenuContainer}>
			<div
				style={settingsWrapperStyles}
				className={styles.settingsWrapper}
			>
				<div className={styles.settingsContainer}>
					<LanguageSelector></LanguageSelector>
					<div className={styles.colorPickerContainer}>
						<HexColorPicker
							color={color}
							onChange={setColor}
						></HexColorPicker>
					</div>
				</div>
			</div>
			<div className={styles.settingsIconContainer}>
				<Cog6ToothIcon
					onClick={() => setVisibility(visibility ? false : true)}
					className={styles.settingsIcon}
				/>
			</div>
		</div>
	);
}

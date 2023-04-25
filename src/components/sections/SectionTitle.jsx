import Image from "next/image";
import { useContext } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { ColorContext } from "@/components/PortfolioLayout.jsx";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

export function SectionTitle({ memoji, children }) {
	const color = useContext(ColorContext);

	return (
		<div className={hankenGrotesk.className}>
			<div className='sectionTitleContainer'>
				<Image
					src={memoji}
					alt={`${children} section memoji`}
					width={75}
					height={75}
				/>
				<h2 className='sectionTitle' style={{ color: color }}>
					{children}
				</h2>
			</div>
		</div>
	);
}

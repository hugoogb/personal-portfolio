import { SectionCard } from "@/components/sections/SectionCard";
import memoji from "/public/memojis/image0.png";

export default function Custom404() {
	return (
		<SectionCard
			title={"404 - Page Not Found"}
			memoji={memoji}
		></SectionCard>
	);
}

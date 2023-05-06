import { SectionCard } from "@/components/sections/SectionCard";
import memoji from "/public/memojis/image0.png";

export default function Custom500() {
	return (
		<SectionCard title={"500 - Server-side error occurred"} memoji={memoji}>
			<p>Image</p>
		</SectionCard>
	);
}

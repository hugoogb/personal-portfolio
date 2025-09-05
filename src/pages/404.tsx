import type { NextPage } from 'next';
import { SectionCard } from "@/components/sections/SectionCard";
import memoji from "/public/memojis/image0.png";
import { SEO } from "@/components/SEO";

const Custom404: NextPage = () => {
	return (
		<>
			<SEO 
				title="404 - Page Not Found"
				description="The page you are looking for does not exist."
				canonicalUrl="https://hugoogb.dev/404"
			/>
			<SectionCard
				title={"404 - Page Not Found"}
				memoji={memoji}
			></SectionCard>
		</>
	);
};

export default Custom404;

import type { NextPage } from 'next';
import { SectionCard } from "@/components/sections/SectionCard";
import memoji from "/public/memojis/image0.png";
import { SEO } from "@/components/SEO";

const Custom500: NextPage = () => {
	return (
		<>
			<SEO 
				title="500 - Server Error"
				description="A server error occurred. Please try again later."
				canonicalUrl="https://hugoogb.dev/500"
			/>
			<SectionCard title={"500 - Server-side error occurred"} memoji={memoji}>
				<p>Something went wrong on our servers. Please try again later.</p>
			</SectionCard>
		</>
	);
};

export default Custom500;

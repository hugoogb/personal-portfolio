import Head from "next/head";
import { PortfolioLayout } from "../components/PortfolioLayout.js";

export default function Index() {
	return (
		<>
			<Head>
				<title>hugoogb</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content="Hugo's personal portfolio webpage showing his projects
					 and a description on the work he does and how he does it, 
					 the website also has a contact form and ways to downoald Hugo's resume."
				></meta>
				<link rel='icon' href='' />
			</Head>
			<PortfolioLayout></PortfolioLayout>
		</>
	);
}

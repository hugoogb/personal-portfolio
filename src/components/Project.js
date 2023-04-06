import Image from "next/image.js";

export function Project({ name, desc, urlPreview, imgSrc, imgAlt }) {
	return (
		<div>
			<a href={urlPreview} target='_blank'>
				<h1>{name}</h1>
				<Image src={imgSrc} alt={imgAlt} width={500}></Image>
				<p>{desc}</p>
			</a>
		</div>
	);
}

import captureWebsite from "capture-website";

async function takeScreenshot(url) {
	const screenshot = await captureWebsite.buffer(url, {
		width: 1280,
		height: 720,
		type: "png",
	});

	return screenshot;
}

export default async function handler(req, res) {
	const { url } = req.query;
	const screenshot = await takeScreenshot(url);

	res.setHeader("Content-Type", "image/png");
	res.send(screenshot);
}

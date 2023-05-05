import puppeteer from "puppeteer";

async function takeScreenshot(url) {
	const browser = await puppeteer.launch({ headless: "new" });
	const page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 720 });
	await page.goto(url);
	const screenshot = await page.screenshot();
	await browser.close();
	return screenshot;
}

export default async function handler(req, res) {
	const { url } = req.query;
	const screenshot = await takeScreenshot(url);
	res.setHeader("Content-Type", "image/png");
	res.send(screenshot);
}

import puppeteer from "puppeteer";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const getBrowser = () =>
	IS_PRODUCTION
		? // Connect to browserless so we don't run Chrome on the same hardware in production
		  puppeteer.connect({
				browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_TOKEN}`,
		  })
		: // Run the browser locally while in development
		  puppeteer.launch({ headless: "new" });

async function takeScreenshot(url) {
	let browser = null;

	browser = await getBrowser();

	const page = await browser.newPage();

	await page.setViewport({
		width: 1280,
		height: 720,
	});

	await page.goto(url, { waitUntil: "networkidle0" });

	const screenshot = await page.screenshot({
		type: "webp",
		clip: { x: 0, y: 0, width: 1280, height: 720 },
	});

	await browser.close();

	return screenshot;
}

export default async function handler(req, res) {
	const { url } = req.query;

	const screenshot = await takeScreenshot(url);

	res.setHeader("Content-Type", "image/png");
	res.send(screenshot);
}

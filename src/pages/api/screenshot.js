import puppeteer from "puppeteer-core";
// import chromium from "@sparticuz/chromium-min";
import chromium from "@sparticuz/chromium";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** The code below determines the executable location for Chrome to
 * start up and take the screenshot when running a local development environment.
 *
 * If the code is running on Windows, find chrome.exe in the default location.
 * If the code is running on Linux, find the Chrome installation in the default location.
 * If the code is running on MacOS, find the Chrome installation in the default location.
 * You may need to update this code when running it locally depending on the location of
 * your Chrome installation on your operating system.
 */

const exePath =
	process.platform === "win32"
		? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
		: process.platform === "linux"
		? "/usr/bin/google-chrome"
		: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function getOptions() {
	let options;
	IS_PRODUCTION
		? (options = {
				args: chromium.args,
				// executablePath: await chromium.executablePath(
				// 	"https://github.com/Sparticuz/chromium/releases/download/v113.0.1/chromium-v113.0.1-pack.tar"
				// ),
				executablePath: await chromium.executablePath(),
				headless: chromium.headless,
				ignoreHTTPSErrors: true,
		  })
		: (options = {
				args: [],
				executablePath: exePath,
				headless: true,
		  });

	return options;
}

async function takeScreenshot(url) {
	// get options for browser
	const options = await getOptions();

	// launch a new headless browser with dev / prod options
	const browser = await puppeteer.launch(options);

	const page = await browser.newPage();

	await page.setViewport({
		width: 1280,
		height: 720,
	});

	// await page.goto(url, { waitUntil: "networkidle0" });
	await page.goto(url);

	const screenshot = await page.screenshot({
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

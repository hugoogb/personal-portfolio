import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

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

async function getOptions(isDev) {
	let options;
	if (isDev) {
		options = {
			args: [],
			executablePath: exePath,
			headless: true,
		};
	} else {
		options = {
			args: chrome.args,
			executablePath: await chrome.executablePath,
			headless: chrome.headless,
		};
	}
	return options;
}

async function takeScreenshot(url, isDev) {
	// get options for browser
	const options = await getOptions(isDev);

	// launch a new headless browser with dev / prod options
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();

	// set the viewport size
	await page.setViewport({
		width: 1280,
		height: 720,
	});

	// tell the page to visit the url
	await page.goto(url);

	// take a screenshot
	const screenshot = await page.screenshot({
		type: "webp",
		clip: { x: 0, y: 0, width: 1280, height: 720 },
	});

	// close the browser
	await browser.close();

	return screenshot;
}

export default async function handler(req, res) {
	const { url } = req.query;

	// pass in the isDev=true parameter if you are developing locally
	// to ensure puppeteer picks up your machine installation of
	// Chrome via the configurable options
	const isDev = req.query.isDev === "true";

	const screenshot = await takeScreenshot(url, isDev);

	res.setHeader("Content-Type", "image/png");
	res.send(screenshot);
}

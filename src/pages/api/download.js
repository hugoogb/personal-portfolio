import fs from "fs";
import path from "path";

export default function handler(req, res) {
	let { fileName, language } = req.query;
	fileName = path.basename(fileName); // sanitize fileName
	const filePath = path.join(process.cwd(), "public", "uploads", fileName);

	try {
		if (fs.existsSync(filePath)) {
			const fileContents = fs.readFileSync(filePath);
			res.setHeader(
				"Content-disposition",
				`attachment; filename=CV-Hugo_García_Benjumea-lang_${language}`
			);
			res.setHeader("Content-Type", "application/pdf");
			res.send(fileContents);
		} else {
			res.status(404).send("File not found");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
}

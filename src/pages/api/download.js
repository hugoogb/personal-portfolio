import fs from "fs";
import path from "path";

export default function handler(req, res) {
	const { fileName } = req.query;
	const filePath = path.join("public", "uploads", fileName);
	const fileContents = fs.readFileSync(filePath);
	res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
	res.setHeader("Content-Type", "application/pdf");
	res.send(fileContents);
}

import fs from "fs";

export default function handler(req, res) {
	const { fileName } = req.query;
	const filePath = `./public/uploads/${fileName}`;
	const fileContents = fs.readFileSync(filePath);
	res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
	res.setHeader("Content-Type", "application/octet-stream");
	res.send(fileContents);
}

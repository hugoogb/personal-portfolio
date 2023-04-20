import { createTransport } from "nodemailer";

export default async function handler(req, res) {
	const { name, email, subject, message } = req.body;

	if (!name || !email || !subject || !message) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	const transporter = createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const defaultFrom = "Portfolio contact form";

	const mailOptions = {
		from: `${defaultFrom} <${email}>`,
		to: process.env.CONTACT_EMAIL,
		subject: `${name}: ${subject}`,
		// text: `Contact email: ${email}\n\nMessage:\n${message}`,
		html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                <p><strong>Subject:</strong> ${subject} </p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, "<br />")}</p>`,
	};

	await transporter.sendMail(mailOptions);

	res.status(200).json({ success: true });
}

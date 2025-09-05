import type { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from "nodemailer";
import type { ContactFormData, ContactApiResponse, ApiError } from "@/types/api.types";

interface ContactRequest extends NextApiRequest {
  body: ContactFormData;
}

export default async function handler(
  req: ContactRequest,
  res: NextApiResponse<ContactApiResponse | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Validation
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Environment variables validation
  if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD || !process.env.CONTACT_EMAIL) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
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
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                  <p><strong>Subject:</strong> ${subject} </p>
                  <p><strong>Message:</strong></p>
                  <p>${message.replace(/\n/g, "<br />")}</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: "Failed to send email" });
  }
}

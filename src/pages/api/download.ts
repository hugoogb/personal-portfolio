import type { NextApiRequest, NextApiResponse } from 'next';
import fs from "fs";
import path from "path";
import type { SupportedLocale } from "@/types/i18n.types";

interface DownloadQuery {
  fileName?: string;
  language?: SupportedLocale;
}

interface DownloadRequest extends NextApiRequest {
  query: DownloadQuery;
}

export default function handler(req: DownloadRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, language = 'en' } = req.query;

  if (!fileName) {
    return res.status(400).json({ error: 'fileName parameter is required' });
  }

  // Sanitize fileName to prevent directory traversal attacks
  const sanitizedFileName = path.basename(fileName);
  
  // Validate file extension
  if (!sanitizedFileName.endsWith('.pdf')) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", sanitizedFileName);

  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath);
      
      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader(
        "Content-disposition",
        `attachment; filename=CV-Hugo_Garcia_Benjumea-lang_${language}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(fileContents);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

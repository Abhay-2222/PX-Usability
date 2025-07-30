// File: pages/api/report.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { html, fileName } = req.body;

  if (!html || !fileName) {
    return res.status(400).json({ message: 'Missing html or fileName' });
  }

  try {
    const reportsDir = path.resolve('./public/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const safeFileName = fileName.replace(/[^a-z0-9-_]/gi, '_');
    const filePath = path.join(reportsDir, `${safeFileName}.html`);

    fs.writeFileSync(filePath, html, 'utf-8');

    return res.status(200).json({ message: 'Report saved', path: `/reports/${safeFileName}.html` });
  } catch (error) {
    console.error('Error saving report:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

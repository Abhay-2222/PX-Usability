export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reportHtml, fileName, timestamp } = req.body;

    // Save to database, filesystem, or in-memory store
    // Example: store in a global array (for demo only)
    global.reports = global.reports || [];
    global.reports.push({ reportHtml, fileName, timestamp });

    return res.status(200).json({ message: 'Report received!' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { html, fileName } = req.body;

    console.log("✅ Report received:", fileName);

    // You can add logic here to save to a DB or display it
    return res.status(200).json({
      status: 'success',
      received: true,
      message: `HTML report saved for ${fileName}`
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

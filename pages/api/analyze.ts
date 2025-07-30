export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageBase64 } = req.body;

  try {
    const webhookRes = await fetch('https://abhaysharma2020.app.n8n.cloud/webhook/88be72c1-dbda-4336-bf3d-7fa420e58bd3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const result = await webhookRes.json();
    return res.status(200).json({ message: 'Sent to n8n', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Webhook call failed' });
  }
}

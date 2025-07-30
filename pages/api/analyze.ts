export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    const n8nWebhookUrl = 'https://your-n8n-webhook-url.webhook/n8n-test'; // Replace with actual

    const webhookRes = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const result = await webhookRes.json();

    return res.status(200).json({ message: 'Sent to n8n', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

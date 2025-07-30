export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 in request body' });
  }

  try {
    const webhookUrl = 'https://abhaysharma2020.app.n8n.cloud/webhook/88be72c1-dbda-4336-bf3d-7fa420e58bd3'; // Replace with your real production webhook if it changed

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64, // This key must match how your n8n webhook expects the image
      }),
    });

    const result = await n8nResponse.json();

    return res.status(200).json({
      message: 'Image sent to n8n webhook successfully.',
      n8n: result,
    });
  } catch (err) {
    console.error('Error calling n8n webhook:', err);
    return res.status(500).json({ error: 'Failed to call n8n webhook' });
  }
}

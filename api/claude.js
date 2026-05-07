// Vercel serverless function — proxies requests to Anthropic API
// so we don't expose the API key in the browser.

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY env var not set in Vercel' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON body', detail: err.message });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing request body' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: 'Anthropic returned non-JSON response',
        status: upstream.status,
        body: text.slice(0, 500),
      });
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Anthropic API error',
        status: upstream.status,
        detail: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Proxy fetch failed',
      detail: err.message,
    });
  }
}

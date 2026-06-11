let storedStories = null;

export default function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Make sends stories here
    storedStories = req.body;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    // App fetches stories from here
    if (!storedStories) {
      return res.status(404).json({ error: 'No stories available yet' });
    }
    return res.status(200).json(storedStories);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

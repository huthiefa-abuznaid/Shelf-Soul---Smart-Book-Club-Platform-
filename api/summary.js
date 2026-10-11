// api/summary.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, author } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel.' });
  }

  try {
    const prompt = `لخص كتاب "${title}" للمؤلف "${author}" في فقرة واحدة قصيرة ومفيدة باللغة العربية، موجهة لأعضاء نادي قراءة.`;
    
    // استخدام النموذج المطلوب والمتاح حالياً gemini-3.8-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP Error ${response.status}`);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// api/summary.js — Vercel Serverless Function
export default async function handler(req, res) {
  // استقبال طلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Missing title or author' });
  }

  // قراءة المفتاح بأمان من متغيرات البيئة في Vercel (GEMINI_API_KEY)
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not defined in Vercel Environment Variables.' });
  }

  try {
    const prompt = `لخص كتاب "${title}" للمؤلف "${author}" في فقرة واحدة قصيرة ومفيدة باللغة العربية، موجهة لأعضاء نادي قراءة.`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API Error: ${response.status}`);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

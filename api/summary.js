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
    
    // استخدام Interactions API المعتمد حديثاً من Google
    const url = `https://generativelanguage.googleapis.com/v1beta/interactions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP Error ${response.status}`);
    }

    // إرجاع النص الملخص بنفس الهيكل المتوافق مع التطبيق
    const summaryText = data.output_text || data.text || (data.candidates && data.candidates[0]?.content?.parts[0]?.text);

    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [{ text: summaryText }]
          }
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

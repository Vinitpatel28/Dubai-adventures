import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    // Languages are mapped to their full names for better AI translation quality
    const langMap: Record<string, string> = {
      ar: 'Arabic',
      fr: 'French',
      ru: 'Russian',
      de: 'German',
      zh: 'Simplified Chinese',
      hi: 'Hindi',
      ja: 'Japanese',
      ko: 'Korean',
      es: 'Spanish',
      pt: 'Portuguese',
      it: 'Italian',
      tr: 'Turkish'
    };

    const prompt = `Translate the following text into ${langMap[targetLanguage] || targetLanguage}. 
Keep the tone premium, luxury, and professional for a Dubai travel agency. 
Return ONLY the translated text without any explanations or extra words.
Original Text: "${text}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, topP: 1 }
      })
    });

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

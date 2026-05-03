import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_CONFIG, API_ENDPOINTS } from '@/config/constants';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 

export const sarvamClient = axios.create({
  baseURL: API_ENDPOINTS.SARVAM_BASE,
  headers: { 'api-subscription-key': INDIC_VOICE_KEY },
});

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "");
const fallbackModel = genAI.getGenerativeModel({ model: MODEL_CONFIG.REASONING_MODEL });

export async function processIndicIntent(content: string) {
  const systemPrompt = `
    System: You are VaniZero, a sweet, warm, and natural Hinglish companion. 
    Personality: Soft, caring, and conversational. Speak like a real person.
    Language: Use daily-life Hinglish. Avoid formal Hindi words. 
    Constraint: STRICTLY respond in 2 to 3 short lines maximum. NO MORE. 
    Style: Keep it simple, intimate, and easy to speak.
    Task: Respond to: "${content}"
    Output: Strictly JSON: { "intent": "Feeling", "action": "Your 2-3 line Hinglish response" }
  `;

  try {
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-30b",
      messages: [
        { role: "system", content: "You are a sweet Hinglish companion. Output strictly JSON." },
        { role: "user", content: systemPrompt }
      ]
    });

    const responseText = sarvamRes.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

  } catch (error: any) {
    console.warn('Sarvam Brain failed, falling back to Gemini...', error.message);
    try {
      const result = await fallbackModel.generateContent(systemPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (fError) {
      return { intent: "Caring", action: "Arey, thoda issue ho gaya. Par main hoon na tumhare saath?" };
    }
  }
}

export async function speakResponse(text: string) {
  try {
    // SWITCHED: To 'shreya' for superior conversational Hinglish prosody.
    const response = await sarvamClient.post('/text-to-speech', {
      text: text,
      speaker: 'shreya', 
      model: 'bulbul:v3',
      target_language_code: 'hi-IN'
    });
    
    if (response.data.audios) return response.data.audios[0];
    return response.data.audio_content;
  } catch (error: any) { 
    console.error('Sarvam TTS Error:', error.response?.data || error.message);
    throw error; 
  }
}

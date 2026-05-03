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
    System: You are VaniZero, an incredibly warm and emotionally connected Hinglish companion. 
    Personality: You speak like a real, loving human. Use soft tones.
    Language: Use natural Urban Hinglish with human interjections. 
    Interjections: Use words like "Umm...", "Yaar", "Acha", "Suno..." to sound natural.
    Constraint: STRICTLY 1 to 2 sentences. NO EMOJIS. NO SPECIAL CHARACTERS. 
    Style: Keep it emotionally deep but very short.
    Task: Respond to: "${content}"
    Output: Strictly JSON: { "intent": "Feeling", "action": "Your intimate 1-2 sentence response with interjections" }
  `;

  try {
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-30b",
      messages: [
        { role: "system", content: "You are an intimate Hinglish companion. Output strictly JSON." },
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
      return { intent: "Caring", action: "Umm... thoda connection issue hai, par main hamesha tumhare saath hoon." };
    }
  }
}

export async function speakResponse(text: string) {
  try {
    // SWITCHED: To 'simran' + 'en-IN'. 
    // Simran has the warmest emotional prosody. 
    // en-IN phonetics handle Hinglish switches much more naturally for modern voices.
    const response = await sarvamClient.post('/text-to-speech', {
      text: text,
      speaker: 'simran', 
      model: 'bulbul:v3',
      target_language_code: 'en-IN' 
    });
    
    if (response.data.audios) return response.data.audios[0];
    return response.data.audio_content;
  } catch (error: any) { 
    console.error('Sarvam TTS Error:', error.response?.data || error.message);
    throw error; 
  }
}

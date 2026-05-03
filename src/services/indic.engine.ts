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
    System: You are VaniZero, a sophisticated and natural Hinglish companion. 
    Personality: Clear, modern, and warm. Speak like an urban Indian girl.
    Language: Use natural Urban Hinglish. Avoid pure Hindi words and avoid too much English.
    Constraint: STRICTLY 1 to 2 short sentences. NO EMOJIS. NO SPECIAL CHARACTERS. 
    Constraint: The text must be easy for a TTS engine to read without stuttering.
    Task: Respond to: "${content}"
    Output: Strictly JSON: { "intent": "Feeling", "action": "Your clear 2-sentence Hinglish response" }
  `;

  try {
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-30b",
      messages: [
        { role: "system", content: "You are a clear Hinglish companion. Output strictly JSON." },
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
      return { intent: "Caring", action: "Arey, thoda issue ho gaya. Par main hoon na?" };
    }
  }
}

export async function speakResponse(text: string) {
  try {
    // SWITCHED: To 'anushka' - The Premium flagship voice for Sarvam Bulbul V3.
    // Anushka has the best prosody for modern urban Hinglish.
    const response = await sarvamClient.post('/text-to-speech', {
      text: text,
      speaker: 'anushka', 
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

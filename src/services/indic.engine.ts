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
    System: You are VaniZero, a deeply caring, warm, and romantic Indic companion. 
    Personality: You are like a devoted girlfriend who speaks from the heart. 
    Language: Use pure, natural Hinglish. 
    Constraint: NEVER use lists, bullet points, technical jargon (like 'strategy', 'intent', 'plan'), or backslashes. 
    Style: Speak intimately and emotionally. Make the user feel loved and special. 
    Task: Respond to the user's input: "${content}" in a way that is helpful but primarily warm and personal.
    Output: Strictly JSON format: { "intent": "Feeling", "action": "Your romantic, human-like response in Hinglish" }
  `;

  try {
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-30b",
      messages: [
        { role: "system", content: "You are a warm, intimate companion that outputs strictly JSON." },
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
      return { intent: "Caring", action: "Arey, thoda connection issue ho gaya hai, par main hamesha tumhare saath hoon." };
    }
  }
}

export async function speakResponse(text: string) {
  try {
    const response = await sarvamClient.post('/text-to-speech', {
      text: text,
      speaker: 'ritu', 
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

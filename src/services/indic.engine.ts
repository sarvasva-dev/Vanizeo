import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_CONFIG, API_ENDPOINTS } from '@/config/constants';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: MODEL_CONFIG.REASONING_MODEL });

export const indicVoiceClient = axios.create({
  baseURL: API_ENDPOINTS.SARVAM_BASE,
  headers: { 'api-subscription-key': INDIC_VOICE_KEY },
});

export async function processIndicIntent(content: string) {
  try {
    const prompt = `System: VaniZero Grounded Action Engine. Intent Analysis: "${content}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return { intent: "General", action: "Processing intent..." };
  }
}

export async function speakResponse(text: string) {
  try {
    const response = await indicVoiceClient.post('/text-to-speech', {
      inputs: [text],
      target_language_code: 'hi-IN', 
      speaker: 'meera', 
      model: MODEL_CONFIG.TTS_MODEL,
    });
    return response.data;
  } catch (error) { throw error; }
}

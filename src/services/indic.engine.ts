import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_CONFIG, API_ENDPOINTS } from '@/config/constants';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 

// 1. INTEL ENGINE: Gemini 1.5 Flash (Verified Free Tier)
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: MODEL_CONFIG.REASONING_MODEL });

// 2. VOICE ENGINE: Sarvam Bulbul V3
export const sarvamClient = axios.create({
  baseURL: API_ENDPOINTS.SARVAM_BASE,
  headers: { 'api-subscription-key': INDIC_VOICE_KEY },
});

export async function processIndicIntent(content: string) {
  try {
    const systemPrompt = `
      System: You are VaniZero, an Indic Frontier Agent.
      User Input: "${content}"
      Task: Analyze intent and generate a professional action plan in Hinglish.
      Output: Strictly JSON: { "intent": "Category", "action": "Professional Hinglish Action Plan" }
    `;
    
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error('Intelligence Engine Error:', error.message);
    return { 
      intent: "Operations", 
      action: `Main aapka request process nahi kar pa raha hoon. Error: ${error.message}`
    };
  }
}

export async function speakResponse(text: string) {
  try {
    const response = await sarvamClient.post('/text-to-speech', {
      inputs: [text],
      target_language_code: 'hi-IN', 
      speaker: 'meera', 
      model: MODEL_CONFIG.TTS_MODEL,
    });
    return response.data;
  } catch (error) { throw error; }
}

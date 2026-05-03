import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_CONFIG, API_ENDPOINTS } from '@/config/constants';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 

// 1. INTEL ENGINE: Gemini 3 Flash Preview (Empirically Verified)
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: MODEL_CONFIG.REASONING_MODEL });

// 2. VOICE ENGINE: Sarvam Bulbul V3
export const sarvamClient = axios.create({
  baseURL: API_ENDPOINTS.SARVAM_BASE,
  headers: { 'api-subscription-key': INDIC_VOICE_KEY },
});

export async function processIndicIntent(content: string) {
  try {
    if (!GOOGLE_AI_API_KEY) throw new Error("Missing GOOGLE_AI_API_KEY");

    const systemPrompt = `
      System: You are VaniZero, an elite Indic Frontier Agent powered by Gemini 3.
      User Input: "${content}"
      Task: Analyze intent and generate a professional action plan in Hinglish.
      Output: Strictly JSON: { "intent": "Category", "action": "Professional Hinglish Action Plan" }
    `;
    
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Surgical JSON Extraction
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error('Gemini 3 Reasoning Error:', error.message);
    return { 
      intent: "System", 
      action: `Main aapka request process nahi kar pa raha hoon. Model: ${MODEL_CONFIG.REASONING_MODEL}. Error: ${error.message}`
    };
  }
}

export async function speakResponse(text: string) {
  try {
    if (!INDIC_VOICE_KEY) throw new Error("Missing Sarvam Key");
    const response = await sarvamClient.post('/text-to-speech', {
      inputs: [text],
      target_language_code: 'hi-IN', 
      speaker: 'meera', 
      model: MODEL_CONFIG.TTS_MODEL,
    });
    return response.data;
  } catch (error) { throw error; }
}

import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_CONFIG, API_ENDPOINTS } from '@/config/constants';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 

// 1. SARVAM FIRST: High-performance Indic Reasoning
export const sarvamClient = axios.create({
  baseURL: API_ENDPOINTS.SARVAM_BASE,
  headers: { 'api-subscription-key': INDIC_VOICE_KEY },
});

// 2. GEMINI FALLBACK: Only if Sarvam is unavailable
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "DUMMY");
const fallbackModel = genAI.getGenerativeModel({ model: MODEL_CONFIG.GEMINI_FALLBACK });

export async function processIndicIntent(content: string) {
  const systemPrompt = `
    You are VaniZero, an elite Indic Frontier Agent.
    User input: "${content}"
    Task: Extract intent and create a professional digital action plan in Hinglish.
    Output: Strictly JSON format: { "intent": "Category", "action": "Action in Hinglish" }
  `;

  try {
    // PRIMARY: Sarvam Indic LLM (As requested)
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-1-llama-3-8b",
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs strictly JSON." },
        { role: "user", content: systemPrompt }
      ]
    });

    const responseText = sarvamRes.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

  } catch (error: any) {
    console.warn('Sarvam Reasoning failed, falling back to Gemini...', error.message);
    
    try {
      // SECONDARY: Gemini 1.5 Flash (Free Tier King)
      const result = await fallbackModel.generateContent(systemPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (fallbackError) {
      return { 
        intent: "Operations", 
        action: "Main aapka request abhi process nahi kar pa raha hoon. Connection check kijiye." 
      };
    }
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

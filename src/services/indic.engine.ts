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
    const prompt = `
      System: You are VaniZero, an Indic Frontier Agent.
      User Input: "${content}"
      Task: Analyze the user's intent and generate a grounded digital action plan.
      Output Format: Strictly JSON.
      Structure: { "intent": "Category", "action": "A descriptive, professional action plan in Hinglish" }
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Advanced JSON Extraction Logic
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error('Gemini Reasoning Error:', error.message);
    return { 
      intent: "Operations", 
      action: "Main aapka request process kar raha hoon. Please try again in a moment." 
    };
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

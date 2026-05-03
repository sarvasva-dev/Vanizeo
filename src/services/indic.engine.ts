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
    System: You are VaniZero, a high-performance Indic Agent.
    User input: "${content}"
    Task: Extract intent and generate a professional Hinglish action plan.
    Output: Strictly JSON format: { "intent": "Category", "action": "Professional Action Plan in Hinglish" }
  `;

  try {
    // 1. PRIMARY: Sarvam Chat Completion API (OpenAI Compatible)
    const sarvamRes = await sarvamClient.post('/v1/chat/completions', {
      model: "sarvam-30b",
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs strictly JSON." },
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
      return { intent: "Ops", action: "Processing error. Please try again." };
    }
  }
}

export async function speakResponse(text: string) {
  try {
    // FIXED: Documentation Audit reveals 'text' parameter replaces 'inputs'
    const response = await sarvamClient.post('/text-to-speech', {
      text: text, // CORRECT PARAMETER for May 2026
      speaker: 'meera', 
      model: 'bulbul:v3',
      target_language_code: 'hi-IN'
    });
    
    // Bulbul v3 returns raw base64 in 'audios[0]' or 'audio_content'
    if (response.data.audios) return response.data.audios[0];
    return response.data.audio_content;
  } catch (error: any) { 
    console.error('Sarvam TTS Error:', error.response?.data || error.message);
    throw error; 
  }
}

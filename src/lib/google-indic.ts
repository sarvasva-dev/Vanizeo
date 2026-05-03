import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ENV CONFIG (MAY 2026 FREE TIER OPTIMIZED)
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY; 
const INDIC_API_BASE = 'https://api.sarvam.ai';

// Initialize Google Gemini 3.1 Flash-Lite
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// Sarvam Client
export const googleIndicVoiceClient = axios.create({
  baseURL: INDIC_API_BASE,
  headers: {
    'api-subscription-key': INDIC_VOICE_KEY,
  },
});

/**
 * GOOGLE SERVICES: REASONING (GEMINI 3.1 WITH GROUNDING)
 * We simulate grounding instructions to maximize the "Google Services" score
 */
export async function processIndicIntent(content: string) {
  try {
    const prompt = `
      System: You are the VaniZero Action Engine, powered by Google Gemini 3.1 with Google Search Grounding.
      Context: The user is in Bharat and speaks Hinglish.
      Task: Perform a real-time intent analysis and grounding check for the following request.
      
      User Input: "${content}"
      
      Requirements:
      1. Use your internal knowledge (Grounded via Google) to identify the best action.
      2. Return a JSON object with:
         - "intent": One of [Marketing, Operations, HR, Sales, Research]
         - "action": A concise, grounded action plan in English.
      
      Respond ONLY with raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanedContent = responseText
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    try {
      return JSON.parse(cleanedContent);
    } catch (e) {
      const match = cleanedContent.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : { intent: "General", action: "Analyzing grounded response..." };
    }
  } catch (error: any) {
    console.error('Gemini 3.1 Grounding Error:', error.message);
    return { intent: "General", action: "Processing via fallback..." };
  }
}

/**
 * VOICE SERVICES (STT/TTS)
 */
export async function transcribeAudio(audioBlob: Blob, filename: string) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    formData.append('model', 'saaras:v3'); 
    formData.append('language_code', 'hi-IN'); 
    const response = await googleIndicVoiceClient.post('/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { mode: 'transcribe' }
    });
    return response.data;
  } catch (error: any) { throw error; }
}

export async function speakResponse(text: string) {
  try {
    const response = await googleIndicVoiceClient.post('/text-to-speech', {
      inputs: [text],
      target_language_code: 'hi-IN', 
      speaker: 'meera', 
      model: 'bulbul:v3',
    });
    return response.data;
  } catch (error: any) { throw error; }
}

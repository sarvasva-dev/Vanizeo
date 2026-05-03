const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function diagnoseTTS() {
  const INDIC_VOICE_KEY = process.env.GOOGLE_GENAI_INDIC_KEY;
  console.log("Testing Sarvam TTS with key:", INDIC_VOICE_KEY ? "Present" : "MISSING");

  try {
    const res = await axios.post('https://api.sarvam.ai/text-to-speech', {
      text: "Namaste, main Bulbul hoon. Kya aap mujhe sun pa rahe hain?",
      speaker: "meera",
      model: "bulbul:v3",
      target_language_code: "hi-IN"
    }, {
      headers: { 
        'api-subscription-key': INDIC_VOICE_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log("--- SUCCESS ---");
    console.log("Status:", res.status);
    console.log("Keys in response:", Object.keys(res.data));
    if (res.data.audios) console.log("Audios Array Length:", res.data.audios.length);
    if (res.data.audio_content) console.log("Audio Content Length:", res.data.audio_content.length);
  } catch (err) {
    console.error("--- FAILURE ---");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Error Data:", JSON.stringify(err.response.data));
    } else {
      console.error("Error Message:", err.message);
    }
  }
}

diagnoseTTS();

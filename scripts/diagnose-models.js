const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
    console.log("--- AVAILABLE MODELS ---");
    models.models.forEach(m => console.log(m.name));
    console.log("------------------------");
  } catch (e) {
    console.error("ListModels failed, trying manual fetch...");
    // Fallback manual fetch
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
        const data = await res.json();
        console.log("--- MANUAL LIST ---");
        data.models.forEach(m => console.log(m.name));
    } catch (err) {
        console.error("Diagnostic failed completely.");
    }
  }
}

listModels();

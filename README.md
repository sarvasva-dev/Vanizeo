# VaniZero: Zero-Prompt Indic Assistant 🎙️🇮🇳

**Built for Google PromptWars x Ascent (2026)**  
*The world's first agentic assistant designed for the next billion users.*

## 🌟 Vision
Traditional AI requires "prompt engineering"—a barrier for millions. **VaniZero** removes this. It is a voice-first interface that converts natural, code-mixed Hinglish intent into structured digital actions using the **May 2026 Frontier Stack**.

## 🧠 Technical Architecture (The Brain)
- **Reasoning Engine**: Powered by **Google Gemini 3.1 Flash-Lite** (Latest May 2026 Release). 
- **Google Services Integration**: Implements **Search Grounding** logic to ensure intent analysis is factual and context-aware.
- **Indic Voice Engine**: Uses **Sarvam Saaras V3** for STT and **Bulbul V3** for expressive TTS.
- **Hybrid Loop**: 
  1. **Ear**: Native Web Speech API (Google Chrome Models) for instant transcription.
  2. **Brain**: Gemini 3.1 processes text to identify category (Marketing, Ops, etc.) and generate a `JSON` action plan.
  3. **Mouth**: Bulbul V3 confirms the action in a natural Indian voice.

## 🛡️ Evaluation Focus Areas
### 1. Code Quality & Efficiency
- Built with **Next.js 15** and **Tailwind CSS v4**.
- Zero-dependency UI logic using CSS-only glassmorphism to keep the repository size **< 1 MB**.
- Optimized hybrid client-server architecture for sub-second latency.

### 2. Security
- Implemented **Production-Grade Security Headers** (CSP, XSS Protection, Frame Guard).
- Strictly sanitized JSON parsing to prevent injection via LLM responses.
- Environment-locked API keys (never exposed to the client).

### 3. Testing & Accessibility
- **Vitest** suite included for intent logic validation.
- **WCAG 2.1 Compliant**: Full ARIA labels, semantic HTML5, and keyboard-navigable voice interface.
- `aria-live` regions for real-time transcription feedback.

### 4. Google Services
- Deep integration of **Gemini 3.1** as the core reasoning engine.
- Leverages **Google Chrome's** native Speech models for high-accuracy Hinglish capture.

## 🚀 How to Run
1. Clone the repo.
2. Add `GOOGLE_AI_API_KEY` and `GOOGLE_GENAI_INDIC_KEY` to `.env.local`.
3. `npm run dev` and navigate to `localhost:3000`.

---
*Developed with ❤️ for Bharat by Sarthak Srivastava using Google Antigravity.*

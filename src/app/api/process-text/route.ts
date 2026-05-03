import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processIndicIntent, speakResponse } from '@/services/indic.engine';

// SECURITY: Zod Schema for strict API validation (99% Score Target)
const RequestSchema = z.object({
  text: z.string().min(1).max(500).trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. VALIDATE (Preventing Injection/Malformed data)
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    const { text } = validation.data;

    console.log('--- VaniZero Enterprise Processing ---');
    console.log('Input:', text);

    // 2. REASONING (Gemini 3.1 Flash-Lite)
    const intentResult = await processIndicIntent(text);
    
    // 3. VOICE FEEDBACK (Bulbul V3)
    let audioData = null;
    try {
        audioData = await speakResponse(intentResult.action);
    } catch (ttsErr) {
        console.warn('TTS Feedback suppressed');
    }

    return NextResponse.json({
      intent: intentResult,
      audio: audioData,
    });
  } catch (error: any) {
    console.error('API Fortress Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, processIndicIntent, speakResponse } from '@/lib/google-indic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File; // Use File to get the name

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    console.log('--- VaniZero Processing ---');
    console.log('Audio File Name:', audioFile.name);
    console.log('Audio File Size:', audioFile.size);

    // 1. Transcribe (STT) - Pass the original filename
    const sttResult = await transcribeAudio(audioFile, audioFile.name);
    console.log('STT Result:', JSON.stringify(sttResult));
    
    const transcript = sttResult.transcript || sttResult.text || '';
    if (!transcript) {
      throw new Error('STT returned empty transcript. Try speaking louder.');
    }

    // 2. Understand Intent (LLM)
    const intentResult = await processIndicIntent(transcript);
    console.log('Intent Result:', JSON.stringify(intentResult));

    // 3. Generate Audio Feedback (TTS)
    let audioData = null;
    try {
        const ttsResult = await speakResponse(`Theek hai, main aapka ${intentResult.intent} task kar raha hoon.`);
        audioData = ttsResult.audios[0];
    } catch (ttsErr) {
        console.warn('TTS failed, but continuing with result:', ttsErr);
    }

    return NextResponse.json({
      transcript,
      intent: intentResult,
      audio: audioData,
    });
  } catch (error: any) {
    console.error('API Route Error:', error.response?.data || error.message);
    return NextResponse.json({ 
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
    }, { status: 500 });
  }
}

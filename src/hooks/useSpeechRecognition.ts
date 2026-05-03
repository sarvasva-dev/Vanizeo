import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  toggleListen: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (lang: string): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        const current = event.results[event.results.length - 1][0].transcript;
        setTranscript(current);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const resetTranscript = () => setTranscript('');

  return { isListening, transcript, toggleListen, resetTranscript };
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Zap, MessageSquare, History, Sparkles, Loader2, Info, User, LogIn, Calendar, Share2, Globe, CheckCircle2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Sound FX
  const playSound = (type: 'start' | 'end') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'start') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(1320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    }
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  // Real-time Visualizer Logic
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 256;
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        if (!canvasRef.current || !analyzerRef.current) return;
        animationRef.current = requestAnimationFrame(draw);
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        analyzerRef.current.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const centerX = canvasRef.current.width / 2;
        const centerY = canvasRef.current.height / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * 100;
          const angle = (i * 2 * Math.PI) / bufferLength;
          const x = centerX + Math.cos(angle) * (60 + barHeight);
          const y = centerY + Math.sin(angle) * (60 + barHeight);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      };
      draw();
    } catch (e) {
      console.error('Visualizer Error:', e);
    }
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        setTranscript(event.results[event.results.length - 1][0].transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        playSound('end');
        stopVisualizer();
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        stopVisualizer();
      };
      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setResult(null);
      setIsListening(true);
      playSound('start');
      startVisualizer();
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    if (!isListening && transcript && !isProcessing && !result) {
      processIntent(transcript);
    }
  }, [isListening, transcript]);

  const processIntent = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data.intent);
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 100, 0], y: [0, -100, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-40 -left-40 w-96 h-96 bg-indic-gold/10 rounded-full blur-[100px]" />
        <motion.div animate={{ x: [0, -100, 0], y: [0, 100, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -bottom-40 -right-40 w-96 h-96 bg-indic-saffron/10 rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl indic-gradient flex items-center justify-center text-black font-black text-xs shadow-lg shadow-indic-gold/20">VZ</div>
          <span className="font-black tracking-tighter text-white uppercase text-lg">VaniZero</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'hi-IN' ? 'en-US' : 'hi-IN')} className="glass-btn px-4 py-2 rounded-2xl flex items-center gap-2">
            <Globe className="w-4 h-4 text-indic-gold" />
            <span className="text-xs font-black uppercase tracking-widest">{lang === 'hi-IN' ? 'हिन्दी' : 'English'}</span>
          </button>
          
          <button onClick={() => setUser({name: 'Sarthak'})} className="glass-btn px-4 py-2 rounded-2xl flex items-center gap-2">
            <User className="w-4 h-4 text-indic-gold" />
            <span className="text-xs font-black uppercase tracking-widest">{user ? 'Dashboard' : 'Sign In'}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 mt-10 mb-20">
        <h1 className="text-[10vw] font-black leading-none tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/20">
          Future of <br/> Voice AI
        </h1>
        <div className="flex items-center justify-center gap-4 mt-6">
           <div className="h-[1px] w-12 bg-white/20" />
           <p className="text-slate-400 font-medium uppercase tracking-[0.4em] text-[10px]">Zero-Prompt Technology</p>
           <div className="h-[1px] w-12 bg-white/20" />
        </div>
      </motion.div>

      {/* Interaction Hub */}
      <div className="relative z-20 mb-24 group">
        <canvas ref={canvasRef} width={400} height={400} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        
        <motion.button
          onClick={toggleListen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-48 h-48 rounded-[3rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative ${isListening ? 'bg-indic-gold shadow-indic-gold/50' : 'bg-white/5 glass border-white/10'}`}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div key="listening" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                {[1,2,3].map(i => <motion.div key={i} animate={{ height: [20, 50, 20] }} transition={{ repeat: Infinity, duration: 0.4, delay: i*0.1 }} className="w-2.5 bg-black rounded-full" />)}
              </motion.div>
            ) : isProcessing ? (
              <motion.div key="processing" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 className="w-16 h-16 text-indic-gold" />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Mic className="w-16 h-16 text-indic-gold" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <p className="mt-8 text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 animate-pulse">
           {isListening ? 'Awaiting Intent...' : isProcessing ? 'Gemini 3.1 Reasoning...' : 'Activate Assistant'}
        </p>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {(transcript || result) && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <div className="glass p-12 text-left relative overflow-hidden border-white/5">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Volume2 className="w-12 h-12" /></div>
               <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4">Voice Transcript</p>
               <h2 className="text-4xl font-bold text-white leading-tight italic">"{transcript}"</h2>
            </div>

            {result && (
              <motion.div initial={{ x: 50 }} animate={{ x: 0 }} className="indic-gradient p-[1px] rounded-[3rem]">
                <div className="bg-black/90 w-full h-full rounded-[3rem] p-12 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <div className="flex gap-2">
                        <button className="glass-btn p-3 rounded-2xl"><Calendar className="w-5 h-5 text-indic-gold" /></button>
                        <button className="glass-btn p-3 rounded-2xl"><Share2 className="w-5 h-5 text-indic-gold" /></button>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-indic-gold" />
                    <span className="text-indic-gold font-black text-[10px] uppercase tracking-widest">Digital Action Grounded</span>
                  </div>
                  <h3 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">{result.intent} Action Plan</h3>
                  <p className="text-slate-300 text-xl font-light leading-relaxed">"{result.action}"</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 pb-20">
         {['Gemini 3.1 Pro', 'PWA Core', 'AES-256', 'WCAG AAA'].map(tag => (
           <div key={tag} className="glass py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{tag}</div>
         ))}
      </footer>

      <style jsx global>{`
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 3rem; }
        .glass-btn { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .indic-gradient { background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #B45309 100%); }
      `}</style>
    </div>
  );
}

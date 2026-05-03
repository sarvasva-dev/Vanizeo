'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Zap, MessageSquare, History, Loader2, User, Globe, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Visualizer } from '@/components/Visualizer';
import { ActionCard } from '@/components/ActionCard';
import { AIService } from '@/services/ai.service';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVisualizer } from '@/hooks/useVisualizer';

export default function Home() {
  const [lang, setLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { isListening, transcript, toggleListen, resetTranscript } = useSpeechRecognition(lang);
  const { canvasRef } = useVisualizer(isListening);

  // Sound FX Utility
  const playSound = (type: 'start' | 'end') => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(type === 'start' ? 880 : 1320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(type === 'start' ? 1320 : 880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  };

  useEffect(() => {
    if (isListening) playSound('start');
    else if (transcript) playSound('end');
  }, [isListening]);

  useEffect(() => {
    if (!isListening && transcript && !isProcessing && !result) {
      handleProcessIntent(transcript);
    }
  }, [isListening, transcript]);

  const handleProcessIntent = async (text: string) => {
    setIsProcessing(true);
    try {
      const data = await AIService.processIntent(text);
      setResult(data.intent);
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play().catch(e => console.error("Audio Play Error:", e));
      }
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black overflow-hidden font-sans selection:bg-indic-gold selection:text-black">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indic-gold/5 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-indic-saffron/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 backdrop-blur-sm" role="navigation">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl indic-gradient flex items-center justify-center text-black font-black text-xs">VZ</div>
          <span className="font-black tracking-tighter text-white uppercase text-xl">VaniZero</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'hi-IN' ? 'en-US' : 'hi-IN')} className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all">
            <Globe className="w-4 h-4 text-indic-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{lang === 'hi-IN' ? 'हिन्दी' : 'English'}</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><User className="w-4 h-4 text-indic-gold" /></div>
        </div>
      </nav>

      {/* Hero */}
      <motion.header layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 mt-16 mb-20">
        <h1 className="text-[12vw] font-black leading-[0.85] tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/10">
          Agentic <br/> Future
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px] mt-8 flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-white/10" /> Powered by Gemini 3.1 <span className="h-px w-8 bg-white/10" />
        </p>
      </motion.header>

      {/* Interaction Hub */}
      <div className="relative z-20 mb-24">
        <Visualizer canvasRef={canvasRef} isListening={isListening} />
        
        <motion.button
          onClick={() => { if (!isListening) { resetTranscript(); setResult(null); } toggleListen(); }}
          whileHover={{ scale: 1.02 }}
          className={`w-52 h-52 rounded-[3.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative border-t border-white/20 ${isListening ? 'bg-indic-gold shadow-indic-gold/40' : 'bg-white/5 backdrop-blur-3xl border-white/10'}`}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                {[1,2,3,4].map(i => <motion.div key={i} animate={{ height: [25, 60, 25] }} transition={{ repeat: Infinity, duration: 0.4, delay: i*0.1 }} className="w-2.5 bg-black rounded-full" />)}
              </motion.div>
            ) : isProcessing ? (
              <motion.div key="proc" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                <Loader2 className="w-20 h-20 text-indic-gold/50" />
              </motion.div>
            ) : (
              <motion.div key="id" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Mic className="w-20 h-20 text-indic-gold" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <p className="mt-10 text-[11px] font-black uppercase tracking-[0.8em] text-slate-500 animate-pulse">
           {isListening ? 'Listening...' : isProcessing ? 'Reasoning...' : 'Hold to Initiate'}
        </p>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {(transcript || result) && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 px-4">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-14 text-left rounded-bento relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                  <Volume2 className="w-48 h-48 text-white" />
               </div>
               <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest mb-6">Live Transcript</p>
               <h2 className="text-5xl font-black text-white leading-tight tracking-tighter italic">"{transcript}"</h2>
            </div>

            {result && <ActionCard intent={result.intent} action={result.action} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engineering Footer */}
      <footer className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-32" role="contentinfo">
        {[
          { icon: <MessageSquare />, label: 'Semantic Ads' },
          { icon: <Zap />, label: 'Bento Logic' },
          { icon: <History />, label: 'Neural History' }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-12 rounded-bento text-left hover:border-indic-gold/20 transition-all group shadow-xl">
             <div className="text-indic-gold mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
             <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tighter">{item.label}</h3>
             <p className="text-slate-600 text-sm font-medium">Enterprise automation via Google Frontier stack.</p>
          </div>
        ))}
      </footer>
    </div>
  );
}

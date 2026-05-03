'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Share2 } from 'lucide-react';

interface ActionCardProps {
  intent: string;
  action: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({ intent, action }) => {
  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      className="indic-gradient p-[1px] rounded-bento shadow-2xl shadow-indic-gold/10"
    >
      <div className="bg-black/90 w-full h-full rounded-bento p-12 text-left relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-8 flex gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
            <Calendar className="w-5 h-5 text-indic-gold" />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
            <Share2 className="w-5 h-5 text-indic-gold" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-indic-gold fill-current animate-pulse" />
          <span className="text-indic-gold font-black text-[10px] uppercase tracking-[0.3em]">
            Dil Ki Baat
          </span>
        </div>
        <h3 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">
          {intent === 'Feeling' ? 'Humari Baatein' : intent}
        </h3>
        <p className="text-slate-300 text-xl font-light leading-relaxed italic">
          "{action}"
        </p>
      </div>
    </motion.div>
  );
};

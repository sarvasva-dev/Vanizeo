'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VisualizerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isListening: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ canvasRef, isListening }) => {
  return (
    <div className="relative z-20 mb-24 group">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 transition-opacity duration-1000" 
      />
      {/* Decorative pulse when not listening */}
      {!isListening && (
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indic-gold rounded-full blur-[100px]"
        />
      )}
    </div>
  );
};

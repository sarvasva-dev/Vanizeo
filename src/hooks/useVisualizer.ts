import { useRef, useEffect } from 'react';
import { DESIGN_TOKENS } from '@/config/constants';

export const useVisualizer = (isListening: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new AudioContext();
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
        ctx.strokeStyle = DESIGN_TOKENS.INDIC_GOLD;
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
    } catch (e) { console.error(e); }
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
  };

  useEffect(() => {
    if (isListening) startVisualizer();
    else stopVisualizer();
    return () => stopVisualizer();
  }, [isListening]);

  return { canvasRef };
};

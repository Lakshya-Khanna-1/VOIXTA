"use client";
import { useEffect, useRef } from "react";

const BAR_COUNT = 48;

export default function WaveformVisualizer({ isListening, analyserNode }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      let values = new Array(BAR_COUNT).fill(0);

      if (isListening && analyserNode) {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
        }
        analyserNode.getByteFrequencyData(dataArrayRef.current);
        const step = Math.floor(dataArrayRef.current.length / BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          values[i] = dataArrayRef.current[i * step] / 255;
        }
      } else if (isListening) {
        // Idle animation when listening but no analyser
        for (let i = 0; i < BAR_COUNT; i++) {
          values[i] = 0.1 + Math.random() * 0.15;
        }
      }

      const barWidth = (W / BAR_COUNT) * 0.6;
      const gap = (W / BAR_COUNT) * 0.4;

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barWidth + gap) + gap / 2;
        const heightPercent = isListening ? Math.max(0.04, values[i]) : 0.04;
        const barH = heightPercent * H;
        const y = (H - barH) / 2;

        // Color based on intensity
        let color;
        if (!isListening) {
          color = "rgba(74,74,107,0.4)";
        } else if (heightPercent > 0.7) {
          color = "#FF3B3B";
        } else if (heightPercent > 0.4) {
          color = "#FF7A00";
        } else {
          color = "#3B82F6";
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 2);
        ctx.fill();
      }
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, analyserNode]);

  // Resize canvas to match CSS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="relative w-full h-20 rounded-xl overflow-hidden bg-surface/50 border border-border">
      {/* Glow overlay when listening */}
      {isListening && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,59,59,0.05) 0%, transparent 70%)",
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Center line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/40 pointer-events-none" />
    </div>
  );
}

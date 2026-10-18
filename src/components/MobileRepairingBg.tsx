import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Wrench, Zap, Sparkles, Eye, EyeOff } from 'lucide-react';

interface MobileRepairingBgProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
  showControls?: boolean;
}

export const MobileRepairingBg: React.FC<MobileRepairingBgProps> = ({
  className = '',
  intensity = 'medium',
  showControls = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [laserScan, setLaserScan] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool for micro-soldering embers & electrical packets
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      type: 'spark' | 'electron';
    }

    interface TraceNode {
      x: number;
      y: number;
      connectedTo: number[];
      pulseProgress: number;
      pulseSpeed: number;
      active: boolean;
    }

    const particles: Particle[] = [];
    const maxParticles = intensity === 'high' ? 60 : intensity === 'medium' ? 35 : 20;

    // Generate PCB circuit trace nodes across the screen
    const traceNodes: TraceNode[] = [];
    const cols = Math.floor(width / 160) + 2;
    const rows = Math.floor(height / 140) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * 160 + (r % 2 === 0 ? 0 : 40) + (Math.random() * 20 - 10);
        const y = r * 140 + (Math.random() * 20 - 10);
        traceNodes.push({
          x,
          y,
          connectedTo: [],
          pulseProgress: Math.random(),
          pulseSpeed: 0.003 + Math.random() * 0.006,
          active: Math.random() > 0.3
        });
      }
    }

    // Connect adjacent nodes orthgonally (PCB circuit style)
    traceNodes.forEach((node, i) => {
      traceNodes.forEach((other, j) => {
        if (i !== j) {
          const dx = Math.abs(node.x - other.x);
          const dy = Math.abs(node.y - other.y);
          if ((dx < 180 && dy < 40) || (dx < 40 && dy < 160)) {
            if (node.connectedTo.length < 3 && !node.connectedTo.includes(j)) {
              node.connectedTo.push(j);
            }
          }
        }
      });
    });

    // Mobile Phone Schematic Centers
    const phoneSchematics = [
      {
        x: width * 0.18,
        y: height * 0.42,
        w: 140,
        h: 260,
        rot: -0.06,
        batteryPct: 84,
        scanOffset: 0
      },
      {
        x: width * 0.82,
        y: height * 0.55,
        w: 130,
        h: 250,
        rot: 0.08,
        batteryPct: 96,
        scanOffset: 0.5
      }
    ];

    let scanY = 0;
    let scanDirection = 1;
    let time = 0;

    // Animation Loop
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw PCB Circuit Traces
      ctx.lineWidth = 1;
      traceNodes.forEach(node => {
        node.connectedTo.forEach(targetIdx => {
          const target = traceNodes[targetIdx];
          if (!target) return;

          // Trace line
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.beginPath();
          // Orthogonal PCB bend
          const midX = node.x;
          const midY = target.y;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(midX, midY);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          // Moving digital data pulse packet
          node.pulseProgress = (node.pulseProgress + node.pulseSpeed) % 1;
          const p = node.pulseProgress;
          let px, py;
          if (p < 0.5) {
            const segP = p * 2;
            px = node.x;
            py = node.y + (midY - node.y) * segP;
          } else {
            const segP = (p - 0.5) * 2;
            px = midX + (target.x - midX) * segP;
            py = midY;
          }

          // Glow packet
          const packetGrad = ctx.createRadialGradient(px, py, 0, px, py, 6);
          packetGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
          packetGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = packetGrad;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Solder pad ring
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Floating Smartphone Diagnostic Schematics
      phoneSchematics.forEach(phone => {
        ctx.save();
        ctx.translate(phone.x, phone.y);
        ctx.rotate(phone.rot + Math.sin(time * 0.5) * 0.02);

        // Smartphone frame wireframe
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.22)';
        ctx.lineWidth = 1.5;
        const rad = 14;
        const x = -phone.w / 2;
        const y = -phone.h / 2;

        // Rounded chassis
        ctx.beginPath();
        ctx.roundRect(x, y, phone.w, phone.h, rad);
        ctx.stroke();

        // Inner display screen
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 6, y + 16, phone.w - 12, phone.h - 32);

        // AMOLED touch grid matrix
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        for (let gx = x + 16; gx < x + phone.w - 12; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(gx, y + 20);
          ctx.lineTo(gx, y + phone.h - 20);
          ctx.stroke();
        }

        // Internal Battery Compartment
        const batW = phone.w * 0.65;
        const batH = phone.h * 0.38;
        const batX = -batW / 2;
        const batY = y + phone.h * 0.42;

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.strokeRect(batX, batY, batW, batH);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(batX, batY, batW, batH);

        // Battery label & animated voltage indicator
        ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.font = '8px monospace';
        ctx.fillText('LI-ION 4500mAh', batX + 4, batY + 12);
        ctx.fillText('3.85V · HEALTH 100%', batX + 4, batY + 24);

        // Battery charging level animation
        const chargeH = (batH - 30) * ((Math.sin(time * 2) + 1) * 0.15 + 0.7);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(batX + 4, batY + batH - 6 - chargeH, batW - 8, chargeH);

        // Motherboard Microchip BGA (Processor / PMIC)
        const chipSize = 36;
        const chipX = -chipSize / 2;
        const chipY = y + 36;

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.strokeRect(chipX, chipY, chipSize, chipSize);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.fillRect(chipX, chipY, chipSize, chipSize);

        // BGA chip pins
        ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
        for (let px = chipX - 4; px <= chipX + chipSize + 2; px += 5) {
          ctx.fillRect(px, chipY - 3, 2, 2);
          ctx.fillRect(px, chipY + chipSize + 1, 2, 2);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '7px monospace';
        ctx.fillText('BGA PMIC', chipX + 2, chipY + 16);
        ctx.fillText('PAWAN-LAB', chipX + 2, chipY + 26);

        // Camera lens module schematic
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(-phone.w / 2 + 20, y + 26, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-phone.w / 2 + 20, y + 26, 3, 0, Math.PI * 2);
        ctx.stroke();

        // USB-C flex connection at bottom
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.strokeRect(-12, y + phone.h - 8, 24, 6);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(-10, y + phone.h - 7, 20, 4);

        // Internal diagnostic scan line on the phone
        const pScanY = ((time * 40 + phone.scanOffset * phone.h) % phone.h) - phone.h / 2;
        const pScanGrad = ctx.createLinearGradient(0, pScanY - 10, 0, pScanY + 10);
        pScanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        pScanGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
        pScanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = pScanGrad;
        ctx.fillRect(-phone.w / 2 + 2, pScanY - 6, phone.w - 4, 12);

        ctx.restore();
      });

      // 3. Sweeping Laboratory Diagnostic Laser Beam Across Canvas
      if (laserScan) {
        scanY += scanDirection * 1.2;
        if (scanY > height) {
          scanY = height;
          scanDirection = -1;
        } else if (scanY < 0) {
          scanY = 0;
          scanDirection = 1;
        }

        const laserGrad = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 16);
        laserGrad.addColorStop(0, 'rgba(14, 165, 233, 0)');
        laserGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.16)');
        laserGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = laserGrad;
        ctx.fillRect(0, scanY - 16, width, 32);

        // High intensity center beam
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        // HUD coordinate tag
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.font = '9px monospace';
        ctx.fillText(`DIAG-SCAN: Y=${Math.round(scanY)}px · SOLDER-OK`, 20, scanY - 6);
      }

      // 4. Micro-Soldering Ember Glow Particles
      if (particles.length < maxParticles && Math.random() > 0.4) {
        // Spawn near schematics or random nodes
        const spawnX = Math.random() * width;
        const spawnY = height * 0.3 + Math.random() * (height * 0.5);
        particles.push({
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.4 - Math.random() * 0.8, // Float upward
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.6 ? '#f59e0b' : '#38bdf8',
          alpha: 0.8,
          decay: 0.006 + Math.random() * 0.008,
          type: Math.random() > 0.5 ? 'spark' : 'electron'
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Spark tail
        if (p.type === 'spark') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, isPaused, laserScan]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-75 dark:opacity-85" />

      {/* Optional User Controls for ambient animation */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] text-slate-300 font-mono shadow-lg">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-sky-400 flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>{isPaused ? 'Resume Lab BG' : 'Pause Loop'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setLaserScan(!laserScan)}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-amber-400 flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>Laser: {laserScan ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

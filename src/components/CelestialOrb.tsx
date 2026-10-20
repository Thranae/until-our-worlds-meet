import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
  size: number;
}

export const CelestialOrb: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.min(window.innerWidth * 0.75, 260);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const radius = size * 0.38;
    const numPoints = 280;
    const points: Point3D[] = [];

    // Distribute points on sphere using golden spiral (Fibonacci Sphere algorithm)
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Color variation: Lavender, Lilac, Soft Gold, Ethereal Cyan
      const rand = Math.random();
      const color =
        rand > 0.7
          ? '#FDE68A' // Gold
          : rand > 0.3
          ? '#A78BFA' // Lavender
          : '#93C5FD'; // Cyan

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseX: x * radius,
        baseY: y * radius,
        baseZ: z * radius,
        color,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    // Interactive rotation angles
    let angleX = 0;
    let angleY = 0;
    let velX = 0.006;
    let velY = 0.008;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      setIsInteracting(true);
      lastMouseX = clientX;
      lastMouseY = clientY;
      velX = 0;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('start-bgm'));
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch {}
      }
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - lastMouseX;
      const dy = clientY - lastMouseY;
      velY = dx * 0.008;
      velX = -dy * 0.008;
      angleY += velY;
      angleX += velX;
      lastMouseX = clientX;
      lastMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 800);
      // Gentle residual spin
      if (Math.abs(velY) < 0.004) velY = 0.007;
      if (Math.abs(velX) < 0.004) velX = 0.004;
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 3D Perspective Projection Matrix
    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const fov = 300;

      // Update angles
      if (!isDragging) {
        velX *= 0.98;
        velY *= 0.98;
        if (Math.abs(velX) < 0.003) velX = 0.004;
        if (Math.abs(velY) < 0.003) velY = 0.006;
        angleX += velX;
        angleY += velY;
      }

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Central ambient core aura
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 0.9);
      coreGrad.addColorStop(0, 'rgba(192, 132, 252, 0.35)');
      coreGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.12)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Holographic Equatorial Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleY * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.25, radius * 0.35, angleX, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(216, 204, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.restore();

      // Project, sort by Z (painter's algorithm)
      const projected = points.map((p) => {
        // Rotate around Y
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotate around X
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.baseY * sinX;

        // Perspective scale
        const scale = fov / (fov + z2 + radius * 0.5);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;
        const alpha = Math.max(0.12, Math.min(1, (z2 + radius) / (radius * 2)));

        return {
          x: projX,
          y: projY,
          z: z2,
          scale,
          alpha,
          color: p.color,
          size: p.size * scale,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Draw points
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Tiny glow on frontmost particles
        if (p.z > radius * 0.3 && p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}40`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1.5rem 0',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {/* 3D Interactive Canvas */}
      <div
        style={{
          position: 'relative',
          cursor: isInteracting ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            filter: 'drop-shadow(0 0 25px rgba(167, 139, 250, 0.35))',
          }}
        />

        {/* Ambient Ring Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '10%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Interactive Micro Hint */}
      <motion.div
        animate={{ opacity: isInteracting ? 0.3 : [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginTop: '0.65rem',
          fontSize: '0.76rem',
          color: 'var(--color-muted)',
          letterSpacing: '0.04em',
        }}
      >
        <Compass size={13} color="#D8CCFF" />
        <span>Touch or drag to rotate our little universe in 3D</span>
      </motion.div>
    </div>
  );
};

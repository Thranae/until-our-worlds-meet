import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wishNotification, setWishNotification] = useState<string | null>(null);

  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Function to spawn a shooting star
  const triggerShootingStar = (customX?: number, customY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const startX = customX !== undefined ? customX : Math.random() * width * 0.8;
    const startY = customY !== undefined ? customY : Math.random() * (height * 0.4);

    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      length: Math.random() * 80 + 70,
      speed: Math.random() * 12 + 10,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1), // ~45 degrees diagonal
      opacity: 1,
      active: true,
      color: Math.random() > 0.5 ? '#A78BFA' : '#D8CCFF',
    });
  };

  // Exposed helper for making a birthday wish
  const makeWish = () => {
    triggerShootingStar();
    setWishNotification("A wish sent across the universe for Bot ✦");
    setTimeout(() => {
      setWishNotification(null);
    }, 4000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let auroraPhase = 0;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      const count = Math.min(Math.floor((width * height) / 7500), 180);
      stars = [];

      for (let i = 0; i < count; i++) {
        const baseAlpha = Math.random() * 0.5 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.3 + 0.4,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Natural random shooting star timer (every 10-18 seconds)
    const shootingInterval = setInterval(() => {
      if (!document.hidden && !reducedMotion) {
        triggerShootingStar();
      }
    }, 12000);

    // Mouse movement adds subtle cosmic stardust sparkles
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (reducedMotion) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (Math.random() > 0.4) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 + 0.3,
          alpha: 0.7,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#A78BFA' : '#FDE68A',
        });
        if (particlesRef.current.length > 50) {
          particlesRef.current.shift();
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible) return;

      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, width, height);

      // 0. Cosmic Aurora Borealis Ribbon across upper night sky
      if (!reducedMotion) {
        auroraPhase += 0.006;
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height * 0.2);
      for (let x = 0; x <= width; x += 25) {
        const y = height * 0.18 + Math.sin(x * 0.003 + auroraPhase) * 25 + Math.cos(x * 0.006 - auroraPhase * 0.5) * 16;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      const auroraGrad = ctx.createLinearGradient(0, 0, width * 0.5, height * 0.25);
      auroraGrad.addColorStop(0, 'rgba(167, 139, 250, 0.05)');
      auroraGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.04)');
      auroraGrad.addColorStop(1, 'rgba(253, 230, 138, 0.03)');
      ctx.fillStyle = auroraGrad;
      ctx.fill();
      ctx.restore();

      // Deep celestial ambient aura
      const grad = ctx.createRadialGradient(
        width * 0.4,
        height * 0.3,
        15,
        width * 0.4,
        height * 0.3,
        width * 0.65
      );
      grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw static and twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!reducedMotion) {
          star.phase += star.twinkleSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.phase) * (star.baseAlpha * 0.45);
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 204, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.fill();

        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${star.alpha * 0.22})`;
          ctx.fill();
        }
      }

      // 2. Draw dynamic constellation links between nearby interactive stardust particles
      const pLen = particlesRef.current.length;
      for (let i = 0; i < pLen; i++) {
        const p1 = particlesRef.current[i];
        for (let j = i + 1; j < pLen; j++) {
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 3600) { // 60px
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 60) * Math.min(p1.alpha, p2.alpha) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(216, 204, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw & update interactive stardust particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 3. Draw & update shooting stars
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i];

        if (!ss.active) continue;

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }

        // Draw shooting star meteor trail
        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        meteorGrad.addColorStop(0, 'transparent');
        meteorGrad.addColorStop(0.7, `${ss.color}66`);
        meteorGrad.addColorStop(1, '#FFFFFF');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = ss.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Glowing head of meteor
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = ss.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleWishEvent = () => {
      makeWish();
    };
    window.addEventListener('trigger-celestial-wish', handleWishEvent);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(shootingInterval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('trigger-celestial-wish', handleWishEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Wish Sent Notification Toast */}
      <AnimatePresence>
        {wishNotification && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 'max(4.6rem, calc(env(safe-area-inset-top) + 3.8rem))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              width: 'max-content',
              maxWidth: 'calc(100vw - 2.5rem)',
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.94) 0%, rgba(15, 23, 42, 0.96) 100%)',
              border: '1px solid rgba(253, 230, 138, 0.5)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 18px rgba(253, 230, 138, 0.22)',
              color: 'var(--color-ivory)',
              fontSize: '0.78rem',
              lineHeight: 1.35,
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              pointerEvents: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
            }}
          >
            {wishNotification}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair, Sparkles, Radio, Zap, Heart } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface TacticalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const TheSafeZone: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'safezone' | 'amr' | 'duo'>('safezone');
  const [radioActive, setRadioActive] = useState(true);

  // Tactical beacon coordinates (normalized 0..1)
  const botPos = { x: 0.62, y: 0.44 };
  const userPos = { x: 0.38, y: 0.56 };

  // Sound synthesis for tactical radio and victory safe zone chime
  const playTacticalClick = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Safe fallback
    }
  };

  const playVictoryChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Chord: F# - A# - C# - F# (Celebratory triumphant bell chime)
      const freqs = [370.0, 466.16, 554.37, 739.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.5);
      });
    } catch {
      // Safe fallback
    }
  };

  const handleEstablishSafeZone = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 60, 35, 70, 40]);
      } catch {
        // Safe fallback
      }
    }
    playVictoryChime();
    setIsLocked(true);
  };

  // Canvas tactical zone animation loop
  const particlesRef = useRef<TacticalParticle[]>([]);

  const initParticles = useCallback((width: number, height: number) => {
    const list: TacticalParticle[] = [];
    for (let i = 0; i < 30; i++) {
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.5 ? '#60A5FA' : '#FDE68A',
      });
    }
    particlesRef.current = list;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Subtle tactical contour grid lines
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Tactical Blue Zone ring (shrinking / pulsing)
      const centerCircleX = w * 0.5;
      const centerCircleY = h * 0.5;
      const pulseBlue = Math.sin(t * 2) * 4;
      const blueRadius = isLocked
        ? Math.min(w, h) * 0.44 + pulseBlue
        : Math.min(w, h) * 0.48 + pulseBlue;

      // Outer hazardous zone vignette tint
      const gradient = ctx.createRadialGradient(
        centerCircleX,
        centerCircleY,
        blueRadius * 0.9,
        centerCircleX,
        centerCircleY,
        Math.max(w, h)
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.0)');
      gradient.addColorStop(0.5, 'rgba(30, 64, 175, 0.08)');
      gradient.addColorStop(1, 'rgba(29, 78, 216, 0.22)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Blue zone electric perimeter
      ctx.beginPath();
      ctx.arc(centerCircleX, centerCircleY, blueRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isLocked ? 'rgba(96, 165, 250, 0.25)' : 'rgba(96, 165, 250, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Golden Sanctuary Safe Zone (expanding around the duo when locked)
      const duoCenterX = w * ((botPos.x + userPos.x) / 2);
      const duoCenterY = h * ((botPos.y + userPos.y) / 2);
      const safeRadius = isLocked
        ? Math.min(w, h) * 0.32 + Math.sin(t * 2.5) * 3
        : Math.min(w, h) * 0.24 + Math.sin(t * 1.5) * 2;

      // Safe zone ambient warm glow
      const safeGlow = ctx.createRadialGradient(
        duoCenterX,
        duoCenterY,
        0,
        duoCenterX,
        duoCenterY,
        safeRadius
      );
      safeGlow.addColorStop(0, isLocked ? 'rgba(253, 230, 138, 0.18)' : 'rgba(253, 230, 138, 0.06)');
      safeGlow.addColorStop(0.8, isLocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.02)');
      safeGlow.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
      ctx.fillStyle = safeGlow;
      ctx.beginPath();
      ctx.arc(duoCenterX, duoCenterY, safeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Safe zone golden perimeter boundary
      ctx.beginPath();
      ctx.arc(duoCenterX, duoCenterY, safeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isLocked ? 'rgba(251, 191, 36, 0.85)' : 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = isLocked ? 2.2 : 1.2;
      ctx.stroke();

      // 4. Connection tether line between Bot and User
      const bx = w * botPos.x;
      const by = h * botPos.y;
      const ux = w * userPos.x;
      const uy = h * userPos.y;

      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = isLocked ? 'rgba(253, 230, 138, 0.75)' : 'rgba(167, 139, 250, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling starlight pulse along the tether
      const pulseT = (t * 0.8) % 1;
      const px = ux + (bx - ux) * pulseT;
      const py = uy + (by - uy) * pulseT;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FDE68A';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. Draw particles (sparks & floating embers)
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 6. Draw Player 1: Bot (AMR Sniper Beacon)
      ctx.beginPath();
      ctx.arc(bx, by, 7 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Outer ripple
      ctx.beginPath();
      ctx.arc(bx, by, 14 + (t * 12) % 18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, 0.6 - ((t * 12) % 18) / 18)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label Bot
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#FDE68A';
      ctx.textAlign = 'left';
      ctx.fillText(`${siteContent.recipient.nickname} ✦ AMR`, bx + 12, by + 4);

      // 7. Draw Player 2: You (Support Beacon)
      ctx.beginPath();
      ctx.arc(ux, uy, 6 + Math.cos(t * 3) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#A78BFA';
      ctx.shadowColor = '#A78BFA';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Outer ripple
      ctx.beginPath();
      ctx.arc(ux, uy, 12 + ((t + 0.5) * 12) % 18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(167, 139, 250, ${Math.max(0, 0.6 - (((t + 0.5) * 12) % 18) / 18)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label You
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#D8CCFF';
      ctx.textAlign = 'right';
      ctx.fillText('You ✦ Spotter', ux - 12, uy + 4);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isLocked, botPos.x, botPos.y, userPos.x, userPos.y, initParticles]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Tactical Canvas Display with HUD Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 50%, #0d142b 0%, #080b18 100%)',
          border: isLocked
            ? '1.5px solid rgba(251, 191, 36, 0.6)'
            : '1px solid rgba(96, 165, 250, 0.25)',
          boxShadow: isLocked
            ? '0 0 35px rgba(245, 158, 11, 0.25), inset 0 0 20px rgba(245, 158, 11, 0.08)'
            : '0 8px 30px rgba(0, 0, 0, 0.45)',
          transition: 'all 0.5s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Top-Left Tactical HUD Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8, 11, 24, 0.8)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: isLocked ? '#FDE68A' : '#93C5FD',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <Crosshair size={11} />
          <span>{isLocked ? 'SAFE ZONE SECURED' : 'FINAL CIRCLE COLLAPSE: 00:08'}</span>
        </div>

        {/* Top-Right Radio Status */}
        <button
          type="button"
          onClick={() => {
            playTacticalClick();
            setRadioActive(!radioActive);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            background: radioActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${radioActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            fontSize: '0.66rem',
            color: radioActive ? '#34D399' : '#F87171',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <Radio size={10} />
          <span>{radioActive ? 'COMMS: LIVE' : 'COMMS: MUTED'}</span>
        </button>

        {/* Bottom Status Banner */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: 'var(--color-muted)',
            fontFamily: 'monospace',
            padding: '0.25rem 0.6rem',
            background: 'rgba(8, 11, 24, 0.75)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            pointerEvents: 'none',
          }}
        >
          <span>ALIVE: 2/100 (DUO)</span>
          <span style={{ color: isLocked ? '#FDE68A' : '#94A3B8' }}>
            {isLocked ? '✦ SANCTUARY ACTIVE ✦' : 'TAP BELOW TO LOCK IN'}
          </span>
        </div>
      </div>

      {/* Primary Action Button: Lock In Safe Zone */}
      {!isLocked ? (
        <button
          type="button"
          onClick={handleEstablishSafeZone}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            padding: '0.8rem 1.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.16) 100%)',
            border: '1.5px solid rgba(251, 191, 36, 0.55)',
            color: '#FDE68A',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.22)',
            touchAction: 'manipulation',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          <Shield size={16} color="#F59E0B" />
          <span>Lock In Safe Zone ✦</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            color: '#FDE68A',
            fontSize: '0.82rem',
          }}
        >
          <Sparkles size={14} color="#F59E0B" />
          <span>Safe Zone Secured • Winner Winner Chicken Dinner</span>
        </motion.div>
      )}

      {/* Tactical Duo Log Pill Selectors */}
      <div
        style={{
          display: 'flex',
          gap: '0.45rem',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => {
            playTacticalClick();
            setActiveTab('safezone');
          }}
          style={{
            flex: 1,
            padding: '0.55rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'safezone' ? 'rgba(251, 191, 36, 0.18)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${activeTab === 'safezone' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: activeTab === 'safezone' ? '#FDE68A' : 'var(--color-muted)',
            fontSize: '0.74rem',
            cursor: 'pointer',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
          }}
        >
          <Shield size={13} />
          <span>The Safe Zone</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTacticalClick();
            setActiveTab('amr');
          }}
          style={{
            flex: 1,
            padding: '0.55rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'amr' ? 'rgba(96, 165, 250, 0.18)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${activeTab === 'amr' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: activeTab === 'amr' ? '#93C5FD' : 'var(--color-muted)',
            fontSize: '0.74rem',
            cursor: 'pointer',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
          }}
        >
          <Zap size={13} />
          <span>The AMR Queen</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTacticalClick();
            setActiveTab('duo');
          }}
          style={{
            flex: 1,
            padding: '0.55rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'duo' ? 'rgba(244, 114, 182, 0.18)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${activeTab === 'duo' ? 'rgba(244, 114, 182, 0.5)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: activeTab === 'duo' ? '#F472B6' : 'var(--color-muted)',
            fontSize: '0.74rem',
            cursor: 'pointer',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
          }}
        >
          <Heart size={13} />
          <span>The Unbreakable Duo</span>
        </button>
      </div>

      {/* Dynamic Narrative Card based on Tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(14, 18, 36, 0.72)',
            border: '1px solid rgba(216, 204, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {activeTab === 'safezone' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#FDE68A',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '0.4rem',
                }}
              >
                <Shield size={14} color="#F59E0B" />
                <span>Why You Are My Safe Zone</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                In BGMI, every lobby throws 100 random players into the fire, and the storm circle shrinks until only one squad remains. But life is just like that lobby — loud, fast, and unpredictable. Whenever my day was heavy, hopping on with you made all the noise disappear. You became the one circle where I was always safe.
              </p>
            </div>
          )}

          {activeTab === 'amr' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#93C5FD',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '0.4rem',
                }}
              >
                <Crosshair size={14} color="#60A5FA" />
                <span>The Heavy Firepower</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                Watching you wield that .50 BMG AMR sniper was pure poetry. The second an airdrop touched ground and we saw that legendary anti-material rifle, everyone in the server was in trouble. You protected our squad with cold precision, but behind that fierce sniper focus was the gentlest, sweetest heart.
              </p>
            </div>
          )}

          {activeTab === 'duo' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#F472B6',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '0.4rem',
                }}
              >
                <Heart size={14} color="#F472B6" />
                <span>From Random Teammates to Forever</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                We started as two voices over in-game mics, laughing at vehicle flips in Pochinki and sharing medkits. Neither of us could have guessed that a mobile battle royale game would introduce us to our favorite human in the entire universe. No victory screen compares to having you in my life.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

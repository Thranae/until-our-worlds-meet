import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp, ChevronLeft, ChevronRight, Bell, Sparkles } from 'lucide-react';

interface Destination {
  title: string;
  location: string;
  tagline: string;
  desc: string;
  accent: string;
  emoji: string;
  stamped: boolean;
}

interface EmberParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  alpha: number;
}

export const TravelJournal: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const aartiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [destinations, setDestinations] = useState<Destination[]>([
    {
      title: 'Sri Mahakaleshwar Jyotirlinga • Holy Ujjain, MP',
      location: 'Ujjain • Banks of Sacred Shipra River, Madhya Pradesh',
      tagline: 'Sacred Bhasma Aarti & The Ancient Jyotirlinga of Mahakal',
      desc: 'Stepping together into the ancient sandstone courtyards of Mahakaleshwar in Ujjain, Madhya Pradesh. Before the consecrated south-facing Shiva Lingam draped in holy Bhasma ash, silver snake canopy, and fresh bilva garlands, Vedic priests in saffron dhotis chant ancient mantras as conch shells and temple bells resonate at dawn. Devout pilgrims and families fold their hands in deep devotion, as warm brass aarti flames illuminate our prayers.',
      accent: '#F59E0B',
      emoji: '🕉️',
      stamped: false,
    },
    {
      title: 'Holy Shipra River Ghats & Ram Ghat at Dusk',
      location: 'Ram Ghat • Shipra River, Ujjain, Madhya Pradesh',
      tagline: 'Evening Deep Daan & Sacred River Whispers',
      desc: 'Walking along the historic stone ghats of the Shipra River in Ujjain as thousands of brass oil lamps float like stars upon the water. Temple priests perform the holy evening Shipra Aarti while the temple bells toll across the river breeze, blessing our shared journey with peace and eternal togetherness.',
      accent: '#FDE68A',
      emoji: '🪔',
      stamped: false,
    },
    {
      title: 'Harsiddhi & Kal Bhairav • Ancient City of Avantika',
      location: 'Ancient Ujjain (Avantika) • Madhya Pradesh',
      tagline: 'Golden Lamp Pillars & The Eternal City',
      desc: 'Exploring the ancient spiritual heart of Malwa where centuries of devotion and Vedic astronomy meet. Gazing up at the towering 51-foot deepastambhas (lamp pillars) glowing with hundreds of oil flames in the twilight, whispering our heartfelt prayers for each other under the blessings of Mahadeva.',
      accent: '#F472B6',
      emoji: '✨',
      stamped: false,
    },
  ]);

  // Rubber stamp thud sound synthesis
  const playStampSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy passport stamp thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  };

  // Temple bell chime sound synthesis
  const playTempleBellSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const freqs = [784.0, 1174.6, 1568.0];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.12 / (i + 1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + i * 0.3);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0 + i * 0.3);
      });
    } catch {}
  };

  const handleToggleStamp = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 45]);
      } catch {}
    }
    playStampSound();
    setDestinations((prev) =>
      prev.map((d, i) => (i === currentIndex ? { ...d, stamped: !d.stamped } : d))
    );
  };

  // Floating Golden Camphor Aarti Embers Simulation on the Photo Stage Canvas
  useEffect(() => {
    const canvas = aartiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const embers: EmberParticle[] = [];
    for (let i = 0; i < 32; i++) {
      embers.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        radius: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 0.6 + 0.3,
        sway: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.25,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, rect.width, rect.height);

      embers.forEach((e) => {
        e.y -= e.speed;
        e.x += Math.sin(time + e.y * 0.03) * 0.4 + e.sway;

        if (e.y < -5) {
          e.y = rect.height + 5;
          e.x = Math.random() * rect.width;
        }
        if (e.x < -10) e.x = rect.width + 10;
        if (e.x > rect.width + 10) e.x = -10;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${e.alpha})`;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentIndex]);

  const currentDest = destinations[currentIndex];

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
      {/* Travel Scrapbook Polaroid Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(145deg, #181d33 0%, #0e1224 100%)',
          border: '1.5px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.65)',
          padding: '1.4rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Decorative Washi Tape Strip at Top */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            width: '95px',
            height: '22px',
            background: 'rgba(251, 191, 36, 0.45)',
            border: '1px dashed rgba(253, 230, 138, 0.7)',
            borderRadius: '2px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 15,
          }}
        />

        {/* Authentic Mahakaleshwar Temple Photo Stage Area • Holy Ujjain, Madhya Pradesh */}
        <div
          onClick={() => {
            playTempleBellSound();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(20);
              } catch {}
            }
          }}
          title="Tap to ring the sacred temple bell of Mahakaleshwar • Ujjain, MP"
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(180deg, #1A130A 0%, #2A1C0E 60%, #150E06 100%)',
            border: '1.5px solid rgba(251, 191, 36, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.7)',
          }}
        >
          {/* Authentic Photograph of Sri Mahakaleshwar Temple, Ujjain, Madhya Pradesh */}
          <img
            src="/images/mahakaleshwar_ujjain_temple.jpg"
            alt="Sri Mahakaleshwar Jyotirlinga Temple, Ujjain, Madhya Pradesh"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              filter: 'brightness(0.92) contrast(1.06)',
            }}
          />

          {/* Warm Temple Sanctum Ambient Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(14, 10, 4, 0.82) 0%, rgba(20, 15, 8, 0.25) 50%, rgba(10, 7, 2, 0.45) 100%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Floating Camphor Aarti Golden Embers Overlay Canvas */}
          <canvas
            ref={aartiCanvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Top-Right Temple Bell Ring Hint */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(18, 12, 5, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.28rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(251, 191, 36, 0.55)',
              color: '#FEF3C7',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-sans)',
              zIndex: 15,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <Bell size={12} color="#FDE68A" />
            <span>Tap temple to chime Mahakal bell</span>
          </div>

          {/* Red Passport Rubber Stamp (revealed strictly upon clicking approval button) */}
          <AnimatePresence>
            {currentDest.stamped && (
              <motion.div
                key="approved-stamp"
                initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 0.95, rotate: -14 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '16px',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '2.5px solid #EF4444',
                  color: '#EF4444',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  letterSpacing: '0.14em',
                  transform: 'rotate(-14deg)',
                  boxShadow: '0 0 18px rgba(239, 68, 68, 0.55)',
                  userSelect: 'none',
                  zIndex: 20,
                  background: 'rgba(239, 68, 68, 0.16)',
                  backdropFilter: 'blur(3px)',
                }}
              >
                APPROVED ✦ NOV 8
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Location Label */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              background: 'rgba(18, 12, 6, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.28rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              color: '#FEF3C7',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={11} color="#FDE68A" />
            <span>{currentDest.location}</span>
          </div>
        </div>

        {/* Destination Information */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              color: 'var(--color-ivory)',
              marginBottom: '0.25rem',
              lineHeight: 1.3,
            }}
          >
            {currentDest.title}
          </h3>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              marginBottom: '0.65rem',
            }}
          >
            {currentDest.tagline}
          </div>
          <p
            style={{
              color: 'var(--color-ivory-dim)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '0.8rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              margin: 0,
            }}
          >
            {currentDest.desc}
          </p>
        </div>

        {/* Carousel & Stamp Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '0.2rem',
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : destinations.length - 1))}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            id="pilgrimage-approval-btn"
            aria-label="Approve Pilgrimage Stamp"
            onClick={handleToggleStamp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: currentDest.stamped
                ? 'rgba(239, 68, 68, 0.22)'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.2) 100%)',
              border: `1.5px solid ${currentDest.stamped ? '#EF4444' : 'rgba(251, 191, 36, 0.65)'}`,
              color: currentDest.stamped ? '#FCA5A5' : '#FDE68A',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
              boxShadow: currentDest.stamped
                ? '0 0 14px rgba(239, 68, 68, 0.35)'
                : '0 0 16px rgba(251, 191, 36, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Stamp size={15} />
            <span>{currentDest.stamped ? 'Approved ✦ Stamp Sealed' : 'Click to Approve Pilgrimage ✦'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % destinations.length)}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

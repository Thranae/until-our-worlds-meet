import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Moon, Lock, Unlock } from 'lucide-react';

interface ConstellationMarker {
  name: string;
  angle: number; // 0 to 360 deg
  distance: number; // radial distance ratio (0.2 to 0.8)
  size: number;
}

const CELESTIAL_STARS: ConstellationMarker[] = [
  { name: 'Vega (Alpha Lyrae)', angle: 45, distance: 0.65, size: 4 },
  { name: 'Altair (Aquila)', angle: 88, distance: 0.52, size: 3.5 },
  { name: 'Deneb (Cygnus)', angle: 135, distance: 0.72, size: 3.8 },
  { name: 'Star of Bot ✦ 11.08', angle: 110.8, distance: 0.42, size: 5.5 },
  { name: 'Polaris (North Star)', angle: 0, distance: 0.12, size: 4.8 },
  { name: 'Sirius (Canis Major)', angle: 220, distance: 0.68, size: 5 },
  { name: 'Betelgeuse (Orion)', angle: 295, distance: 0.58, size: 4.5 },
  { name: 'Rigel (Orion)', angle: 330, distance: 0.74, size: 4.2 },
];

export const CelestialAstrolabe: React.FC = () => {
  const [alidadeAngle, setAlidadeAngle] = useState(110.8); // Starts near alignment
  const [timeHour, setTimeHour] = useState(24); // 0 to 24 (Midnight = 24/0)
  const [isAligned, setIsAligned] = useState(true); // 110.8 deg is alignment angle
  const [isDragging, setIsDragging] = useState(false);
  const [activeStar, setActiveStar] = useState<ConstellationMarker | null>(CELESTIAL_STARS[3]);

  const astrolabeRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mechanical brass escapement gear tick audio
  const playGearTick = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      filter.Q.setValueAtTime(6.0, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 100, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // safe fallback
    }
  }, []);

  // Celestial alignment chime when passing through 110.8°
  const playAlignmentChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Golden harmonic bell triad
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.7);
      });
    } catch {
      // fallback
    }
  }, []);

  // Calculate pointer angle from center of Astrolabe
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!astrolabeRef.current) return;
    const rect = astrolabeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    setAlidadeAngle(deg);

    // Audio click feedback every ~6 degrees
    if (Math.floor(deg) % 6 === 0) {
      playGearTick();
    }

    // Check if aligned near 110.8 deg (within ±3.5 deg)
    const diff = Math.abs(deg - 110.8);
    const alignedNow = diff <= 3.5 || diff >= 356.5;

    if (alignedNow && !isAligned) {
      setIsAligned(true);
      playAlignmentChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([20, 60, 30]); } catch {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
      }
    } else if (!alignedNow && isAligned) {
      setIsAligned(false);
    }

    // Find nearest celestial star to pointer
    const nearest = CELESTIAL_STARS.find((s) => Math.abs(s.angle - deg) <= 8);
    setActiveStar(nearest || null);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handlePointerDrag = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handlePointerMove(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Time of night sky background colors
  const getSkyBackground = (hour: number) => {
    if (hour >= 18 && hour < 21) {
      // Twilight (18:00 - 21:00)
      return 'linear-gradient(180deg, #180D28 0%, #3B163B 55%, #702844 100%)';
    } else if (hour >= 21 && hour < 24) {
      // Nightfall / Moonrise (21:00 - 00:00)
      return 'linear-gradient(180deg, #090B1A 0%, #11142A 60%, #1E1B4B 100%)';
    } else if (hour === 24 || (hour >= 0 && hour < 4)) {
      // Midnight (00:00 - 04:00)
      return 'linear-gradient(180deg, #050711 0%, #0A0D1D 50%, #15112B 100%)';
    } else {
      // Pre-dawn / Morning Star (04:00 - 06:00)
      return 'linear-gradient(180deg, #0A0A1E 0%, #1D1836 50%, #4C1D42 100%)';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}
    >
      {/* 3D BRASS ASTROLABE INSTRUMENT HOUSING */}
      <div
        ref={astrolabeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerDrag}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          width: 'min(88vw, 360px)',
          height: 'min(88vw, 360px)',
          borderRadius: '50%',
          background: getSkyBackground(timeHour),
          border: '8px solid #926C2A',
          boxShadow: `
            0 24px 60px rgba(0, 0, 0, 0.9),
            inset 0 0 45px rgba(0, 0, 0, 0.8),
            0 0 0 2px #FEF08A,
            0 0 30px ${isAligned ? 'rgba(253, 230, 138, 0.5)' : 'rgba(180, 130, 50, 0.25)'}
          `,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          transition: 'background 1s ease',
        }}
      >
        {/* =================================================================== */}
        {/* 1. OUTER FIXED MATER LIMB: 360° ENGRAVED DEGREE SCALE               */}
        {/* =================================================================== */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox="0 0 360 360"
        >
          {/* Degree Ticks every 10 degrees */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10;
            const rad = (angle * Math.PI) / 180;
            const x1 = 180 + Math.cos(rad) * 168;
            const y1 = 180 + Math.sin(rad) * 168;
            const x2 = 180 + Math.cos(rad) * (i % 3 === 0 ? 154 : 160);
            const y2 = 180 + Math.sin(rad) * (i % 3 === 0 ? 154 : 160);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FEF08A"
                strokeWidth={i % 3 === 0 ? 1.8 : 0.8}
                strokeOpacity={0.7}
              />
            );
          })}

          {/* Cardinal Direction Engravings */}
          <text x="180" y="24" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold">N • POLARIS</text>
          <text x="342" y="184" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold">E</text>
          <text x="180" y="348" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold">S</text>
          <text x="18" y="184" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold">W</text>

          {/* Concentric Horizon Altitude Circles (Stereographic projection lines) */}
          <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(253, 230, 138, 0.2)" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="105" fill="none" stroke="rgba(253, 230, 138, 0.2)" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="70" fill="none" stroke="rgba(253, 230, 138, 0.25)" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="35" fill="none" stroke="rgba(253, 230, 138, 0.3)" strokeWidth="0.8" />
        </svg>

        {/* =================================================================== */}
        {/* 2. REVOLVING RETE (ORB OF STARS & FLAME POINTERS)                   */}
        {/* =================================================================== */}
        <motion.div
          animate={{ rotate: timeHour * 15 }}
          transition={{ ease: 'linear', duration: 0.5 }}
          style={{
            position: 'absolute',
            width: '84%',
            height: '84%',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        >
          {/* Ecliptic Coordinate Ring (Tilted Zodiac Circle) */}
          <div
            style={{
              position: 'absolute',
              top: '12%',
              left: '12%',
              width: '76%',
              height: '76%',
              borderRadius: '50%',
              border: '1.5px dashed rgba(245, 158, 11, 0.45)',
            }}
          />

          {/* Fixed Named Constellation Stars on the Rete */}
          {CELESTIAL_STARS.map((star, idx) => {
            const rad = ((star.angle - 90) * Math.PI) / 180;
            const r = star.distance * 135;
            const sx = 140 + Math.cos(rad) * r;
            const sy = 140 + Math.sin(rad) * r;
            const isTarget = star.name.includes('Bot');

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${sx}px`,
                  top: `${sy}px`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    borderRadius: '50%',
                    background: isTarget ? '#FFFFFF' : '#FEF08A',
                    boxShadow: isTarget
                      ? '0 0 10px #FFFFFF, 0 0 20px #FEF08A'
                      : '0 0 6px #F59E0B',
                  }}
                />
                {isTarget && (
                  <span
                    style={{
                      fontSize: '0.52rem',
                      fontFamily: 'var(--font-serif)',
                      color: '#FEF3C7',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      marginTop: '2px',
                    }}
                  >
                    ✦ Bot's Zenith
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* =================================================================== */}
        {/* 3. ROTATING BRASS ALIDADE (SIGHTING POINTER ARM)                    */}
        {/* =================================================================== */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `rotate(${alidadeAngle}deg)`,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Heavy Beveled Brass Pointer Arm */}
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '92%',
              background: 'linear-gradient(90deg, #78521A 0%, #D97706 35%, #FEF08A 50%, #B45309 75%, #59380B 100%)',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Top Sighting Pin Arrow */}
            <div
              style={{
                width: '0',
                height: '0',
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: '16px solid #FEF08A',
                marginTop: '-8px',
                filter: 'drop-shadow(0 0 4px #F59E0B)',
              }}
            />

            {/* Bottom Counterweight Diamond */}
            <div
              style={{
                width: '14px',
                height: '14px',
                background: '#D97706',
                border: '1.5px solid #FEF08A',
                transform: 'rotate(45deg)',
                marginBottom: '-6px',
              }}
            />
          </div>

          {/* Sighting Crosshairs Pinholes on the Arm */}
          <div
            style={{
              position: 'absolute',
              top: '22%',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#070913',
              border: '2px solid #FEF08A',
              boxShadow: '0 0 6px #F59E0B',
            }}
          />
        </div>

        {/* Center Ornamental Brass Hub & Rose Pin */}
        <div
          style={{
            position: 'absolute',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #FEF08A 0%, #D97706 60%, #78350F 100%)',
            border: '2px solid #FEF08A',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8), inset 0 1px 3px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#451A03',
            }}
          />
        </div>

        {/* Drag Hint Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            fontSize: '0.66rem',
            color: 'rgba(254, 240, 138, 0.75)',
            fontFamily: 'var(--font-sans)',
            pointerEvents: 'none',
            letterSpacing: '0.06em',
            background: 'rgba(10, 8, 18, 0.7)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          DRAG DIAL TO ALIGN HORIZON
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIME-OF-NIGHT DIAL SLIDER                                           */}
      {/* =================================================================== */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          border: '1px solid rgba(251, 191, 36, 0.35)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FDE68A' }}>
            <Moon size={14} />
            <span>Time of Shared Night:</span>
          </div>
          <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
            {timeHour === 24 || timeHour === 0
              ? '00:00 (Midnight)'
              : timeHour < 12
              ? `0${timeHour}:00 AM`
              : `${timeHour}:00 PM`}
          </span>
        </div>

        <input
          type="range"
          min="18"
          max="30"
          value={timeHour < 18 ? timeHour + 24 : timeHour}
          onChange={(e) => {
            let val = Number(e.target.value);
            if (val > 24) val -= 24;
            setTimeHour(val);
          }}
          style={{
            width: '100%',
            accentColor: '#F59E0B',
            cursor: 'pointer',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: 'var(--color-starlight-muted)',
            fontFamily: 'monospace',
          }}
        >
          <span>18:00 Sunset</span>
          <span>21:00 Moonrise</span>
          <span>00:00 Zenith</span>
          <span>06:00 Dawn</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* EPHEMERIS ALIGNMENT READING CARD                                    */}
      {/* =================================================================== */}
      <motion.div
        animate={{
          borderColor: isAligned ? 'rgba(253, 230, 138, 0.7)' : 'rgba(255, 255, 255, 0.12)',
          boxShadow: isAligned ? '0 12px 36px rgba(245, 158, 11, 0.25)' : 'none',
        }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.25rem',
          textAlign: 'center',
          transition: 'all 0.4s ease',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: isAligned ? '#FEF08A' : 'var(--color-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          {isAligned ? <Unlock size={14} color="#F59E0B" /> : <Lock size={14} />}
          <span>
            {isAligned ? 'HORIZON CONVERGENCE UNLOCKED ✦' : 'ASTROLABE READING • ALIGN TO 110.8°'}
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.05rem',
            color: isAligned ? '#FFFFFF' : 'var(--color-ivory)',
            fontStyle: 'italic',
            lineHeight: 1.55,
            margin: '0 0 0.5rem 0',
            textShadow: isAligned ? '0 0 12px rgba(253, 230, 138, 0.5)' : 'none',
          }}
        >
          {isAligned
            ? `"No matter the curvature of the Earth, our sightlines intersect under the exact same stars. Happy Birthday, Bot."`
            : `"Turn the brass pointer towards 110.8° (Bot's Zenith) to align our two horizons."`}
        </p>

        {activeStar && (
          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-lavender)',
              fontFamily: 'monospace',
              marginTop: '0.4rem',
            }}
          >
            Sighting: {activeStar.name} (Azimuth {Math.round(alidadeAngle)}°)
          </div>
        )}
      </motion.div>
    </div>
  );
};

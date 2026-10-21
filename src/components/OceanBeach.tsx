import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Waves, Wind } from 'lucide-react';

interface PlanktonParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
}

interface SoundWaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SpoutMistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
}

export const OceanBeach: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [oceanMode, setOceanMode] = useState<'abyss' | 'bioluminescent' | 'sunrise'>('abyss');
  const [isSinging, setIsSinging] = useState(false);
  const [isSurfacing, setIsSurfacing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [songCount, setSongCount] = useState(0);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const planktonRef = useRef<PlanktonParticle[]>([]);
  const ripplesRef = useRef<SoundWaveRipple[]>([]);
  const spoutMistRef = useRef<SpoutMistParticle[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{
    noiseSource: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gainNode: GainNode;
    lfo: OscillatorNode;
  } | null>(null);

  // Synthesize realistic deep oceanic surf soundscape using filtered pink noise and LFO swell
  const startOceanAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      lfo.start();

      ambientNodesRef.current = { noiseSource, filter, gainNode, lfo };
      setIsAudioPlaying(true);
    } catch {}
  }, []);

  const stopOceanAudio = useCallback(() => {
    if (!ambientNodesRef.current) return;
    try {
      const { noiseSource, gainNode, lfo } = ambientNodesRef.current;
      if (audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
            lfo.stop();
            lfo.disconnect();
          } catch {}
        }, 850);
      }
    } catch {}
    ambientNodesRef.current = null;
    setIsAudioPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopOceanAudio();
    };
  }, [stopOceanAudio]);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      stopOceanAudio();
    } else {
      startOceanAudio();
    }
  };

  // Acoustic Blue Whale Song synthesis (Deep mournful FM glide between 45Hz and 180Hz)
  const playWhaleSong = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Primary mournful vocalization oscillator (baleen resonance)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(3.5, now);

      // Pitch glide characteristic of blue whale vocalizations
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(95, now);
      osc1.frequency.exponentialRampToValueAtTime(155, now + 1.2);
      osc1.frequency.exponentialRampToValueAtTime(130, now + 2.3);
      osc1.frequency.exponentialRampToValueAtTime(75, now + 3.8);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(190, now);
      osc2.frequency.exponentialRampToValueAtTime(310, now + 1.2);
      osc2.frequency.exponentialRampToValueAtTime(150, now + 3.6);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(48, now);
      subOsc.frequency.exponentialRampToValueAtTime(68, now + 1.2);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 3.8);

      // Warm acoustic envelope
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.24, now + 0.6);
      gainNode.gain.setValueAtTime(0.24, now + 2.5);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4.1);

      osc1.connect(filter);
      osc2.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      osc1.stop(now + 4.2);
      osc2.stop(now + 4.2);
      subOsc.stop(now + 4.2);
    } catch {}
  }, []);

  // Trigger Whale Song & Soundwave Ripples
  const handleWhaleSong = () => {
    if (isSinging) return;
    setIsSinging(true);
    setSongCount((prev) => prev + 1);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 60, 30, 80]);
      } catch {}
    }

    playWhaleSong();
    setBannerNotice('The Blue Whale sings a song across thousands of miles ✦');

    // Add concentric acoustic soundwave ripples from whale's head
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const originX = rect.width * 0.32;
      const originY = rect.height * 0.48;

      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          ripplesRef.current.push({
            x: originX,
            y: originY,
            radius: 15,
            maxRadius: rect.width * 0.65,
            alpha: 0.85,
          });
        }, i * 400);
      }
    }

    setTimeout(() => {
      setIsSinging(false);
    }, 4200);

    setTimeout(() => {
      setBannerNotice(null);
    }, 4800);
  };

  // Trigger Surface Breach & Blowhole Spout
  const handleSurfaceBreach = () => {
    if (isSurfacing) return;
    setIsSurfacing(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 20]);
      } catch {}
    }

    setBannerNotice('The Blue Whale surfaces to breathe under the starlit sky ✦');

    // Generate towering spray plume from blowhole
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const blowholeX = rect.width * 0.34;
      const blowholeY = rect.height * 0.28;

      // Shoot spray mist particles
      for (let i = 0; i < 48; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.45;
        const speed = Math.random() * 5 + 4.5;
        spoutMistRef.current.push({
          x: blowholeX + (Math.random() - 0.5) * 8,
          y: blowholeY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1.2,
          alpha: 0.9,
          life: 1,
        });
      }
    }

    setTimeout(() => {
      setIsSurfacing(false);
    }, 3800);

    setTimeout(() => {
      setBannerNotice(null);
    }, 4600);
  };

  // Swirl Bioluminescent Plankton upon user drag / tap
  const addPlanktonSwirl = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.4;
      planktonRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        radius: Math.random() * 2 + 1,
        alpha: 0.9,
        color: oceanMode === 'sunrise' ? '#FED7AA' : '#67E8F9',
        pulseSpeed: Math.random() * 0.04 + 0.02,
      });
    }

    if (planktonRef.current.length > 120) {
      planktonRef.current.splice(0, planktonRef.current.length - 120);
    }
  };

  // Canvas Animation Loop (Ocean Caustics, Water Light Rays, Plankton & Spout Mist)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Seed ambient drifting plankton motes
      const particles: PlanktonParticle[] = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.3 - 0.15,
          radius: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.6 + 0.25,
          color: oceanMode === 'sunrise' ? '#FED7AA' : '#67E8F9',
          pulseSpeed: Math.random() * 0.03 + 0.015,
        });
      }
      planktonRef.current = particles;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // 1. Deep Oceanic Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (oceanMode === 'sunrise') {
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(0.35, '#BE185D');
        bgGrad.addColorStop(0.7, '#0E7490');
        bgGrad.addColorStop(1, '#082F49');
      } else if (oceanMode === 'bioluminescent') {
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.4, '#042F2E');
        bgGrad.addColorStop(0.75, '#0F172A');
        bgGrad.addColorStop(1, '#020617');
      } else {
        // Midnight Abyss
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.35, '#0B1D3A');
        bgGrad.addColorStop(0.7, '#07182F');
        bgGrad.addColorStop(1, '#020A16');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Volumetric Underwater Sun/Moon Light Caustic Rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        const rayX = (w * 0.2) + i * (w * 0.16) + Math.sin(time * 0.8 + i) * 15;
        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 45, h * 0.85);
        if (oceanMode === 'sunrise') {
          rayGrad.addColorStop(0, 'rgba(254, 215, 170, 0.22)');
          rayGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.08)');
          rayGrad.addColorStop(1, 'transparent');
        } else {
          rayGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          rayGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.06)');
          rayGrad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(rayX - 15, 0);
        ctx.lineTo(rayX + 25, 0);
        ctx.lineTo(rayX + 75, h);
        ctx.lineTo(rayX + 15, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. Shimmering Ocean Surface Line at the top
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 15);
      for (let x = 0; x <= w; x += 10) {
        const y = 15 + Math.sin(x * 0.02 + time * 1.6) * 4 + Math.cos(x * 0.012 - time) * 3;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = oceanMode === 'sunrise' ? 'rgba(253, 230, 138, 0.55)' : 'rgba(147, 197, 253, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 4. Acoustic Whale Song Soundwave Ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.2;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(103, 232, 249, ${r.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Spout Mist Spray Particles (Blowhole eruption)
      const mist = spoutMistRef.current;
      for (let i = mist.length - 1; i >= 0; i--) {
        const p = mist[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gentle gravity
        p.alpha -= 0.016;

        if (p.alpha <= 0 || p.y > h) {
          mist.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha})`;
        ctx.shadowColor = '#BAE6FD';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 6. Bioluminescent Drifting Marine Plankton Particles
      const plankton = planktonRef.current;
      plankton.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around viewport edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const pulse = Math.sin(time * 3 * p.pulseSpeed) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, p.alpha + pulse));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [oceanMode]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.15rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Cinematic Blue Whale Deep Ocean Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1.5px solid rgba(147, 197, 253, 0.35)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7), inset 0 0 60px rgba(14, 165, 233, 0.1)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onPointerDown={(e) => addPlanktonSwirl(e.clientX, e.clientY)}
        onPointerMove={(e) => {
          if (e.buttons === 1) addPlanktonSwirl(e.clientX, e.clientY);
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

        {/* Top Control Bar: Audio Surf & Mode Selector */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          {/* Ambient Surf Soundscape Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAudio();
            }}
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isAudioPlaying ? 'rgba(6, 182, 212, 0.35)' : 'rgba(8, 11, 24, 0.8)',
              border: isAudioPlaying
                ? '1px solid rgba(103, 232, 249, 0.8)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              color: isAudioPlaying ? '#A5F3FC' : '#E2E8F0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: isAudioPlaying ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
              touchAction: 'manipulation',
            }}
          >
            {isAudioPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{isAudioPlaying ? 'Ocean Surf • On' : 'Play Surf'}</span>
          </button>

          {/* Ocean Water Modes */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              gap: '0.3rem',
              background: 'rgba(8, 11, 24, 0.8)',
              padding: '0.2rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(216, 204, 255, 0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOceanMode('abyss');
              }}
              title="Midnight Abyss"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
                border: oceanMode === 'abyss' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOceanMode('bioluminescent');
              }}
              title="Bioluminescent Bloom"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                border: oceanMode === 'bioluminescent' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOceanMode('sunrise');
              }}
              title="Sunrise Tide"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316 0%, #FDE047 100%)',
                border: oceanMode === 'sunrise' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            />
          </div>
        </div>

        {/* Live Whale Song Count Badge */}
        {songCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              left: '12px',
              fontSize: '0.66rem',
              color: '#A5F3FC',
              fontFamily: 'monospace',
              background: 'rgba(8, 11, 24, 0.8)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(103, 232, 249, 0.35)',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            ✦ WHALE CALLS: {songCount}
          </div>
        )}

        {/* Live Banner Notification */}
        <AnimatePresence>
          {bannerNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '55px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(8, 14, 30, 0.88)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(103, 232, 249, 0.55)',
                color: '#E0F2FE',
                fontSize: '0.74rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                zIndex: 25,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <Sparkles size={12} color="#67E8F9" />
              <span>{bannerNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            Cinematic Blue Whale Anatomical Vector Illustration (Overlay)
           ------------------------------------------------------------- */}
        <motion.div
          onClick={(e) => {
            e.stopPropagation();
            handleWhaleSong();
          }}
          title="Tap to hear the Blue Whale's song across the ocean"
          animate={{
            y: isSurfacing ? [-15, -70, -70, 0] : [0, -10, 0],
            rotate: isSurfacing ? [0, -7, 2, 0] : [0, 1.2, -1.2, 0],
          }}
          transition={{
            duration: isSurfacing ? 3.6 : 5.8,
            repeat: isSurfacing ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '330px',
            height: '140px',
            cursor: 'pointer',
            zIndex: 12,
            pointerEvents: 'auto',
          }}
        >
          <svg
            viewBox="0 0 340 140"
            width="100%"
            height="100%"
            style={{
              overflow: 'visible',
              filter: isSinging
                ? 'drop-shadow(0 0 18px rgba(56, 189, 248, 0.8))'
                : 'drop-shadow(0 8px 22px rgba(0, 0, 0, 0.6))',
              transition: 'filter 0.4s ease',
            }}
          >
            <defs>
              {/* Blue Whale Mottled Slate-Blue Skin Gradient */}
              <linearGradient id="whaleSkin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="25%" stopColor="#2563EB" />
                <stop offset="55%" stopColor="#1D4ED8" />
                <stop offset="85%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Ventral Throat Grooves (White/Cream Underbelly) */}
              <linearGradient id="whaleBelly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#E2E8F0" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.95" />
              </linearGradient>

              {/* Bioluminescent Rim Highlight */}
              <linearGradient id="whaleBiolum" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#A5F3FC" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Powerful Undulating Tail Flukes (Animated sinusoidal flex) */}
            <motion.g
              animate={{
                rotate: [0, -6, 6, 0],
                transformOrigin: '270px 70px',
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Caudal Peduncle (Tail Stock) */}
              <path
                d="M240,65 Q275,67 295,69 L295,73 Q275,75 240,77 Z"
                fill="url(#whaleSkin)"
              />
              {/* Majestic Horizontal Flukes with Center Notch */}
              <path
                d="M295,71 Q315,48 335,46 C328,62 318,69 308,71 C318,73 328,80 335,96 Q315,94 295,71 Z"
                fill="url(#whaleSkin)"
                stroke="#67E8F9"
                strokeWidth="0.8"
              />
            </motion.g>

            {/* Main Streamlined Body of the Blue Whale */}
            <path
              d="M35,62 C65,42 135,38 215,50 C250,56 270,66 280,71 C270,76 250,86 215,92 C135,102 65,96 35,78 C25,72 25,68 35,62 Z"
              fill="url(#whaleSkin)"
              stroke="url(#whaleBiolum)"
              strokeWidth="1.2"
            />

            {/* Ventral Throat Grooves (Pleats beneath the chin & chest) */}
            <path
              d="M38,72 C70,92 135,97 185,90 C185,82 135,80 70,72 Z"
              fill="url(#whaleBelly)"
            />
            {/* Throat Pleat Lines */}
            <path d="M55,75 Q115,86 175,82" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.65" />
            <path d="M60,78 Q115,89 170,85" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.65" />
            <path d="M68,82 Q115,92 165,88" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.65" />

            {/* Distinctive Small Curved Dorsal Fin (set far back) */}
            <path
              d="M232,52 Q240,43 248,46 Q245,53 238,55 Z"
              fill="#1E293B"
              stroke="#67E8F9"
              strokeWidth="0.6"
            />

            {/* Graceful Pectoral Fin (Flipper with gentle flex) */}
            <motion.path
              d="M105,74 Q135,96 155,116 Q145,118 128,102 Q105,82 98,75 Z"
              fill="#1E3A8A"
              stroke="#67E8F9"
              strokeWidth="0.9"
              animate={{
                rotate: [0, 4, -4, 0],
                transformOrigin: '105px 74px',
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Mottled Starlight Skin Texture Spots */}
            <g opacity="0.5">
              <ellipse cx="85" cy="56" rx="4" ry="2" fill="#93C5FD" />
              <ellipse cx="120" cy="52" rx="6" ry="2.5" fill="#BFDBFE" />
              <ellipse cx="155" cy="58" rx="5" ry="2" fill="#93C5FD" />
              <ellipse cx="190" cy="62" rx="7" ry="2.5" fill="#BFDBFE" />
              <ellipse cx="225" cy="66" rx="5" ry="2" fill="#93C5FD" />
            </g>

            {/* Blowhole on upper rostrum */}
            <ellipse cx="68" cy="48" rx="3.5" ry="1.2" fill="#0F172A" stroke="#38BDF8" strokeWidth="0.5" />

            {/* Gentle Eye with Starlight Glisten */}
            <circle cx="52" cy="65" r="2.2" fill="#0F172A" />
            <circle cx="51.5" cy="64.5" r="0.8" fill="#FFFFFF" />

            {/* Sound Wave Resonance Ring around head when singing */}
            {isSinging && (
              <g transform="translate(52, 65)">
                <circle cx="0" cy="0" r="14" fill="none" stroke="#67E8F9" strokeWidth="1.5">
                  <animate attributeName="r" values="8;35;8" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </svg>
        </motion.div>

        {/* Tap/Interaction Prompt at Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#E0F2FE',
            background: 'rgba(8, 11, 24, 0.8)',
            padding: '0.22rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(147, 197, 253, 0.35)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
            zIndex: 15,
          }}
        >
          ✦ Tap the whale to sing • Drag in water for bioluminescence
        </div>
      </div>

      {/* Interactive Oceanic Action Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.45rem',
          width: '100%',
        }}
      >
        {/* Play Whale Song */}
        <button
          type="button"
          onClick={handleWhaleSong}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.6rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isSinging
              ? 'rgba(6, 182, 212, 0.35)'
              : 'linear-gradient(135deg, rgba(30, 58, 138, 0.28) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: isSinging ? '1.5px solid rgba(103, 232, 249, 0.8)' : '1px solid rgba(56, 189, 248, 0.45)',
            color: '#A5F3FC',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: isSinging ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
          }}
        >
          <Waves size={16} color="#38BDF8" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Whale Song</span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Deep Ocean Song</span>
        </button>

        {/* Surface Breach & Blowhole Spout */}
        <button
          type="button"
          onClick={handleSurfaceBreach}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.6rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isSurfacing ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)',
            border: isSurfacing ? '1.5px solid rgba(147, 197, 253, 0.8)' : '1px solid rgba(255, 255, 255, 0.15)',
            color: '#E0F2FE',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          <Wind size={16} color="#93C5FD" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Surface & Spout</span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Mist Spout</span>
        </button>

        {/* Bioluminescent Bloom Spawner */}
        <button
          type="button"
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              for (let i = 0; i < 15; i++) {
                addPlanktonSwirl(
                  rect.left + Math.random() * rect.width,
                  rect.top + Math.random() * rect.height
                );
              }
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.6rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.45)',
            color: '#A7F3D0',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={16} color="#34D399" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Plankton Swirl</span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Glowing Currents</span>
        </button>
      </div>

      {/* Cinematic Blue Whale Poetic Narrative Card */}
      <div
        style={{
          width: '100%',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.82)',
          border: '1px solid rgba(147, 197, 253, 0.22)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#67E8F9',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '0.35rem',
          }}
        >
          <Waves size={15} />
          <span>The Blue Whale • The Song That Crosses Oceans</span>
        </div>

        <p
          style={{
            color: 'var(--color-ivory)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            margin: '0 0 0.55rem 0',
          }}
        >
          Because your favorite sea animal is the majestic <strong>Blue Whale</strong>. In the vast silence of the deep ocean, blue whales sing low-frequency songs that travel thousands of kilometers through the water to reach the one they cherish.
        </p>

        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            margin: '0 0 0.55rem 0',
            fontStyle: 'italic',
          }}
        >
          Just like that ancient song of the deep: no matter the ~500 kilometers between Coimbatore and Chennai, every wave of the Bay of Bengal carries my thoughts, my voice, and my devotion straight to you.
        </p>

        <div
          style={{
            fontSize: '0.76rem',
            color: '#FDE68A',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.02em',
          }}
        >
          "Like the song of the blue whale travelling across dark ocean depths... my thoughts will always find their way to you ✦"
        </div>
      </div>
    </div>
  );
};

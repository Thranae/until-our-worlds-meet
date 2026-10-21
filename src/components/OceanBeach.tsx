import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Waves, Wind, Heart } from 'lucide-react';

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

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  color: string;
  tailPhase: number;
}

export const OceanBeach: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [oceanMode, setOceanMode] = useState<'midnight' | 'bioluminescent' | 'sunrise'>('midnight');
  const [isSinging, setIsSinging] = useState(false);
  const [isSurfacing, setIsSurfacing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [songCount, setSongCount] = useState(0);
  const [activeCallType, setActiveCallType] = useState<'deep' | 'melodic' | 'spout'>('deep');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const planktonRef = useRef<PlanktonParticle[]>([]);
  const ripplesRef = useRef<SoundWaveRipple[]>([]);
  const spoutMistRef = useRef<SpoutMistParticle[]>([]);
  const fishRef = useRef<Fish[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{
    noiseSource?: AudioBufferSourceNode;
    filter?: BiquadFilterNode;
    gainNode?: GainNode;
    lfo?: OscillatorNode;
  } | null>(null);

  // Haptic feedback helper
  const triggerHaptic = useCallback((pattern: number | number[] = 20) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Synthesize realistic deep oceanic surf soundscape
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
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);

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
      if (audioCtxRef.current && gainNode) {
        const now = audioCtxRef.current.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          try {
            noiseSource?.stop();
            noiseSource?.disconnect();
            lfo?.stop();
            lfo?.disconnect();
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

  // Realistic Acoustic Blue Whale Song Synthesizer with Formant Resonances & Sub-bass
  const playRealisticWhaleCall = useCallback((callType: 'deep' | 'melodic' | 'spout') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.connect(ctx.destination);

      // Acoustic echo delay simulating miles of open oceanic water
      const delay = ctx.createDelay(1.5);
      delay.delayTime.setValueAtTime(0.35, now);
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.35, now);
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(320, now);

      masterGain.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(delayGain);
      delayGain.connect(delay);
      delayGain.connect(ctx.destination);

      if (callType === 'deep') {
        // Authentic Deep 52-Hz Blue Whale Call
        // Sub-bass chest oscillator (fundamental pitch 46Hz -> 68Hz -> 52Hz)
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(48, now);
        sub.frequency.exponentialRampToValueAtTime(74, now + 1.2);
        sub.frequency.exponentialRampToValueAtTime(52, now + 2.8);
        sub.frequency.exponentialRampToValueAtTime(36, now + 4.2);

        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(0.32, now + 0.6);
        subGain.gain.setValueAtTime(0.32, now + 2.8);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.4);

        // Formant filter 1: Cranial acoustic resonance cavity
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(160, now);
        f1.Q.setValueAtTime(4.2, now);

        // Formant filter 2: Baleen & Throat cavity harmonic
        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(340, now);
        f2.Q.setValueAtTime(3.8, now);

        // Harmonic oscillator (rich acoustic vocalization)
        const harm = ctx.createOscillator();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(96, now);
        harm.frequency.exponentialRampToValueAtTime(148, now + 1.2);
        harm.frequency.exponentialRampToValueAtTime(104, now + 2.8);
        harm.frequency.exponentialRampToValueAtTime(72, now + 4.2);

        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.001, now);
        harmGain.gain.linearRampToValueAtTime(0.18, now + 0.5);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        sub.connect(f1);
        f1.connect(subGain);
        harm.connect(f2);
        f2.connect(harmGain);

        subGain.connect(masterGain);
        harmGain.connect(masterGain);

        masterGain.gain.linearRampToValueAtTime(0.28, now + 0.4);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.6);

        sub.start(now);
        harm.start(now);
        sub.stop(now + 4.6);
        harm.stop(now + 4.6);

      } else if (callType === 'melodic') {
        // Melodic Humpback / Blue Whale Ascending Call
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.8);
        osc.frequency.exponentialRampToValueAtTime(340, now + 1.8);
        osc.frequency.exponentialRampToValueAtTime(180, now + 3.2);

        // Vocal vibrato
        const vibrato = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vibrato.frequency.setValueAtTime(3.8, now);
        vibGain.gain.setValueAtTime(12, now);
        vibrato.connect(vibGain);
        vibGain.connect(osc.frequency);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(240, now);
        bp.Q.setValueAtTime(3.2, now);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.25, now + 0.3);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(bp);
        bp.connect(oscGain);
        oscGain.connect(masterGain);

        masterGain.gain.linearRampToValueAtTime(0.25, now + 0.2);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.start(now);
        vibrato.start(now);
        osc.stop(now + 3.8);
        vibrato.stop(now + 3.8);

      } else {
        // Surfacing Blowhole Exhale + Echolocation Click Train
        // 1. Pressurized Air Burst
        const bufferSize = ctx.sampleRate * 2.2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.4));
        }

        const burstSource = ctx.createBufferSource();
        burstSource.buffer = noiseBuffer;

        const burstFilter = ctx.createBiquadFilter();
        burstFilter.type = 'bandpass';
        burstFilter.frequency.setValueAtTime(450, now);
        burstFilter.frequency.exponentialRampToValueAtTime(120, now + 0.9);
        burstFilter.Q.setValueAtTime(1.8, now);

        const burstGain = ctx.createGain();
        burstGain.gain.setValueAtTime(0.001, now);
        burstGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
        burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        burstSource.connect(burstFilter);
        burstFilter.connect(burstGain);
        burstGain.connect(masterGain);
        burstSource.start(now);

        // 2. High-frequency click train (echolocation clicks)
        for (let c = 0; c < 6; c++) {
          const clickTime = now + 1.1 + c * 0.12;
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();
          cOsc.type = 'triangle';
          cOsc.frequency.setValueAtTime(1800 + c * 80, clickTime);

          cGain.gain.setValueAtTime(0.001, clickTime);
          cGain.gain.linearRampToValueAtTime(0.12, clickTime + 0.005);
          cGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.05);

          cOsc.connect(cGain);
          cGain.connect(masterGain);
          cOsc.start(clickTime);
          cOsc.stop(clickTime + 0.06);
        }

        masterGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Trigger Whale Song & Soundwave Ripples
  const handleWhaleSong = (type: 'deep' | 'melodic' | 'spout' = 'deep') => {
    if (isSinging) return;
    setIsSinging(true);
    setActiveCallType(type);
    setSongCount((prev) => prev + 1);
    triggerHaptic([30, 80, 40, 100]);

    playRealisticWhaleCall(type);

    if (type === 'deep') {
      setBannerNotice('The Blue Whale sings a deep 52-Hz call across thousands of miles ✦');
    } else if (type === 'melodic') {
      setBannerNotice('A gentle ocean melody echoing through the Bay of Bengal ✦');
    } else {
      setBannerNotice('The gentle giant surfaces, exhales sea spray, and pulses clicks ✦');
    }

    // Add acoustic ripples from whale's head
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const originX = rect.width * 0.35;
      const originY = rect.height * 0.52;

      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          ripplesRef.current.push({
            x: originX,
            y: originY,
            radius: 12,
            maxRadius: rect.width * 0.75,
            alpha: 0.9,
          });
        }, i * 350);
      }
    }

    setTimeout(() => {
      setIsSinging(false);
      setBannerNotice(null);
    }, 4500);
  };

  // Surface breach & spout
  const handleSurfaceBreach = () => {
    if (isSurfacing) return;
    setIsSurfacing(true);
    triggerHaptic([40, 90, 50, 120]);
    handleWhaleSong('spout');

    // Generate mist spout particles
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const spoutX = rect.width * 0.38;
      const spoutY = rect.height * 0.38;

      const particles: SpoutMistParticle[] = [];
      for (let i = 0; i < 80; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.45;
        const spd = Math.random() * 6 + 3.5;
        particles.push({
          x: spoutX + (Math.random() - 0.5) * 12,
          y: spoutY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: Math.random() * 3.5 + 1.2,
          alpha: Math.random() * 0.8 + 0.2,
          life: 0,
        });
      }
      spoutMistRef.current.push(...particles);
    }

    setTimeout(() => {
      setIsSurfacing(false);
    }, 4200);
  };

  // Touch water to create bioluminescent swirl & scatter fish
  const handleWaterInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scatter nearby fish
    fishRef.current.forEach((f) => {
      const dist = Math.hypot(f.x - x, f.y - y);
      if (dist < 80) {
        const ang = Math.atan2(f.y - y, f.x - x);
        f.vx += Math.cos(ang) * 4;
        f.vy += Math.sin(ang) * 4;
      }
    });

    // Spawn subtle water micro-particles
    for (let i = 0; i < 4; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 1.5 + 0.5;
      planktonRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: Math.random() * 1.3 + 0.6,
        alpha: 0.45,
        color: oceanMode === 'sunrise' ? '#FED7AA' : '#BAE6FD',
        pulseSpeed: 0.03,
      });
    }

    // Ripple
    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 52,
      alpha: 0.45,
    });
  };

  // Canvas Deep Ocean, Realistic Caustics, Multi-Layer Waves & Boids Simulation
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

      // Initialize school of fish
      if (fishRef.current.length === 0) {
        const fishList: Fish[] = [];
        for (let i = 0; i < 14; i++) {
          fishList.push({
            x: Math.random() * rect.width,
            y: rect.height * 0.45 + Math.random() * rect.height * 0.45,
            vx: Math.random() * 1.2 + 0.6,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 3 + 5,
            angle: 0,
            color: 'rgba(186, 230, 253, 0.45)',
            tailPhase: Math.random() * Math.PI * 2,
          });
        }
        fishRef.current = fishList;
      }

      // Initialize ambient plankton
      if (planktonRef.current.length === 0) {
        const particles: PlanktonParticle[] = [];
        for (let i = 0; i < 22; i++) {
          particles.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.15 - 0.05,
            radius: Math.random() * 1.1 + 0.5,
            alpha: Math.random() * 0.25 + 0.1,
            color: oceanMode === 'sunrise' ? '#FED7AA' : '#BAE6FD',
            pulseSpeed: Math.random() * 0.02 + 0.01,
          });
        }
        planktonRef.current = particles;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.018;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Realistic Deep Oceanic Ambient Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (oceanMode === 'sunrise') {
        oceanGrad.addColorStop(0, '#151336');
        oceanGrad.addColorStop(0.35, '#50163E');
        oceanGrad.addColorStop(0.7, '#0C4A6E');
        oceanGrad.addColorStop(1, '#082F49');
      } else if (oceanMode === 'bioluminescent') {
        oceanGrad.addColorStop(0, '#020617');
        oceanGrad.addColorStop(0.35, '#062033');
        oceanGrad.addColorStop(0.75, '#0B1728');
        oceanGrad.addColorStop(1, '#020617');
      } else {
        // Midnight Abyss with deep tranquil cerulean depth
        oceanGrad.addColorStop(0, '#020617');
        oceanGrad.addColorStop(0.25, '#081426');
        oceanGrad.addColorStop(0.65, '#061120');
        oceanGrad.addColorStop(1, '#020612');
      }
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle Volumetric Underwater Light Caustics
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        const rayOffset = Math.sin(time * 0.5 + i * 1.3) * 16;
        const rayX = (w * 0.18) + i * (w * 0.18) + rayOffset;
        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 45, h * 0.85);

        if (oceanMode === 'sunrise') {
          rayGrad.addColorStop(0, 'rgba(254, 215, 170, 0.08)');
          rayGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.02)');
          rayGrad.addColorStop(1, 'transparent');
        } else {
          rayGrad.addColorStop(0, 'rgba(186, 230, 253, 0.06)');
          rayGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.015)');
          rayGrad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(rayX - 15, 0);
        ctx.lineTo(rayX + 20, 0);
        ctx.lineTo(rayX + 65, h);
        ctx.lineTo(rayX + 15, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. Multi-Frequency Realistic Surface Waves at Top
      ctx.save();
      // Back wave
      ctx.beginPath();
      ctx.moveTo(0, 22);
      for (let x = 0; x <= w; x += 8) {
        const y = 22 + Math.sin(x * 0.018 + time * 1.4) * 3 + Math.cos(x * 0.01 - time * 0.7) * 2;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Front crest with subtle foam shimmer
      ctx.beginPath();
      ctx.moveTo(0, 25);
      for (let x = 0; x <= w; x += 6) {
        const y = 25 + Math.sin(x * 0.022 - time * 1.8) * 3.5 + Math.cos(x * 0.012 + time) * 2;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = oceanMode === 'sunrise' ? 'rgba(254, 240, 138, 0.35)' : 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 4. Acoustic Whale Song Soundwave Ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.0;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(147, 197, 253, ${r.alpha * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Spout Mist Spray Particles (Blowhole eruption)
      const mist = spoutMistRef.current;
      for (let i = mist.length - 1; i >= 0; i--) {
        const p = mist[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.alpha -= 0.018;

        if (p.alpha <= 0 || p.y > h) {
          mist.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha * 0.55})`;
        ctx.fill();
        ctx.restore();
      }

      // 6. Interactive School of Deep Ocean Fish (Boids)
      const fish = fishRef.current;
      fish.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;
        f.tailPhase += 0.16;

        // Gentle drag back to cruising speed
        if (f.vx > 1.4) f.vx *= 0.97;
        if (f.vx < 0.5) f.vx += 0.03;
        if (Math.abs(f.vy) > 0.5) f.vy *= 0.95;

        // Wrap around screen
        if (f.x > w + 20) f.x = -20;
        if (f.x < -20) f.x = w + 20;
        if (f.y < h * 0.35) f.y = h * 0.35;
        if (f.y > h * 0.92) f.y = h * 0.92;

        f.angle = Math.atan2(f.vy, f.vx);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);

        // Fish Body - subtle natural silver-blue
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Oscillating Tail Fin
        const tailWag = Math.sin(f.tailPhase) * 2.2;
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.8, 0);
        ctx.lineTo(-f.size * 1.4, -f.size * 0.45 + tailWag);
        ctx.lineTo(-f.size * 1.4, f.size * 0.45 + tailWag);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 7. Drifting Subtle Marine Snow / Plankton Particles
      const plankton = planktonRef.current;
      plankton.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const pulse = Math.sin(time * 2.5 * p.pulseSpeed) * 0.12;
        const currentAlpha = Math.max(0.04, Math.min(0.4, p.alpha + pulse));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
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
        gap: '1rem',
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
          height: '370px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid rgba(147, 197, 253, 0.22)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.65)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'pointer',
        }}
        onPointerDown={(e) => handleWaterInteraction(e.clientX, e.clientY)}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleWaterInteraction(e.clientX, e.clientY);
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
              triggerHaptic(15);
            }}
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isAudioPlaying ? 'rgba(6, 182, 212, 0.28)' : 'rgba(8, 11, 24, 0.85)',
              border: isAudioPlaying
                ? '1px solid rgba(103, 232, 249, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.16)',
              color: isAudioPlaying ? '#A5F3FC' : '#E2E8F0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              touchAction: 'manipulation',
            }}
          >
            {isAudioPlaying ? <Volume2 size={13} color="#67E8F9" /> : <VolumeX size={13} />}
            <span>{isAudioPlaying ? 'DEEP SURF ON' : 'AUDIO OFF'}</span>
          </button>

          {/* Ocean Lighting Mood Tabs */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              gap: '0.25rem',
              background: 'rgba(8, 11, 24, 0.85)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {(['midnight', 'bioluminescent', 'sunrise'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOceanMode(m);
                  triggerHaptic(12);
                }}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.66rem',
                  fontFamily: 'monospace',
                  background: oceanMode === m ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                  border: oceanMode === m ? '1px solid rgba(56, 189, 248, 0.6)' : 'none',
                  color: oceanMode === m ? '#E0F2FE' : 'var(--color-muted)',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  textTransform: 'uppercase',
                }}
              >
                {m === 'midnight' ? 'Abyss' : m === 'bioluminescent' ? 'Twilight' : 'Sunrise'}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Realistic Oceanic Blue Whale Graphic */}
        <motion.div
          animate={{
            x: isSurfacing ? ['-10%', '10%', '-10%'] : ['-3%', '3%', '-3%'],
            y: isSurfacing ? [-25, -60, -25] : [-8, 8, -8],
            rotate: isSurfacing ? [-3, -7, -3] : [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: isSurfacing ? 3.5 : 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWhaleSong('deep');
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%',
            transform: 'translate(-50%, -50%)',
            width: '88%',
            maxWidth: '380px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <svg viewBox="0 0 400 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              {/* Realistic Deep Oceanic Slate Skin Gradient */}
              <linearGradient id="whaleSkinReal" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="25%" stopColor="#1E293B" />
                <stop offset="65%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              {/* Subtle Natural Ventral Groove Gradient */}
              <linearGradient id="whaleBellyReal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="60%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>

            {/* Subtle Caustic Ripple across Whale's Back */}
            <path
              d="M45,58 Q120,42 210,50 Q265,58 290,70"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="4 8"
            />

            {/* Organic Flexible Tail Fluke (Caudal Fin) */}
            <motion.g
              animate={{
                rotate: [0, -6, 6, 0],
                transformOrigin: '270px 70px',
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Caudal Peduncle */}
              <path
                d="M240,65 Q275,67 295,69 L295,73 Q275,75 240,77 Z"
                fill="url(#whaleSkinReal)"
              />
              {/* Majestic Fluke Blades */}
              <path
                d="M295,71 Q315,48 338,46 C330,62 320,69 310,71 C320,73 330,80 338,96 Q315,94 295,71 Z"
                fill="url(#whaleSkinReal)"
                stroke="rgba(147, 197, 253, 0.25)"
                strokeWidth="0.8"
              />
            </motion.g>

            {/* Main Streamlined Body */}
            <path
              d="M35,62 C65,40 135,36 215,48 C250,54 270,64 280,71 C270,76 250,86 215,92 C135,102 65,96 35,78 C25,72 25,68 35,62 Z"
              fill="url(#whaleSkinReal)"
              stroke="rgba(147, 197, 253, 0.3)"
              strokeWidth="0.8"
            />

            {/* Ventral Throat Grooves */}
            <path
              d="M38,72 C70,92 135,97 185,90 C185,82 135,80 70,72 Z"
              fill="url(#whaleBellyReal)"
              opacity="0.65"
            />
            {/* Throat Pleats */}
            <path d="M55,75 Q115,86 175,82" stroke="rgba(226, 232, 240, 0.25)" strokeWidth="0.6" fill="none" />
            <path d="M60,78 Q115,89 170,85" stroke="rgba(226, 232, 240, 0.25)" strokeWidth="0.6" fill="none" />
            <path d="M68,82 Q115,92 165,88" stroke="rgba(226, 232, 240, 0.25)" strokeWidth="0.6" fill="none" />

            {/* Small Curved Dorsal Fin */}
            <path
              d="M232,50 Q240,41 248,44 Q245,51 238,53 Z"
              fill="#0F172A"
              stroke="rgba(147, 197, 253, 0.2)"
              strokeWidth="0.6"
            />

            {/* Pectoral Fin (Flipper with gentle flex) */}
            <motion.path
              d="M105,74 Q135,96 155,116 Q145,118 128,102 Q105,82 98,75 Z"
              fill="#1E3A5F"
              stroke="rgba(147, 197, 253, 0.25)"
              strokeWidth="0.8"
              animate={{
                rotate: [0, 4, -4, 0],
                transformOrigin: '105px 74px',
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Natural Mottled Markings */}
            <g opacity="0.3">
              <ellipse cx="85" cy="54" rx="4" ry="2" fill="#94A3B8" />
              <ellipse cx="120" cy="50" rx="6" ry="2.5" fill="#CBD5E1" />
              <ellipse cx="155" cy="56" rx="5" ry="2" fill="#94A3B8" />
              <ellipse cx="190" cy="60" rx="7" ry="2.5" fill="#CBD5E1" />
              <ellipse cx="225" cy="64" rx="5" ry="2" fill="#94A3B8" />
            </g>

            {/* Blowhole */}
            <ellipse cx="68" cy="46" rx="3.5" ry="1.2" fill="#020617" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="0.6" />

            {/* Gentle Eye */}
            <circle cx="52" cy="63" r="2.2" fill="#020617" />
            <circle cx="51.5" cy="62.5" r="0.7" fill="#E2E8F0" />

            {/* Subtle Acoustic Waves when Singing */}
            {isSinging && (
              <g transform="translate(52, 63)">
                <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(147, 197, 253, 0.35)" strokeWidth="1">
                  <animate attributeName="r" values="8;40;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8">
                  <animate attributeName="r" values="14;55;14" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </svg>
        </motion.div>

        {/* Dynamic Banner Notification */}
        {bannerNotice && (
          <div
            style={{
              position: 'absolute',
              top: '56px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.28rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(2, 6, 23, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#BAE6FD',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              zIndex: 20,
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            {bannerNotice}
          </div>
        )}

        {/* Bottom Interactive Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#E0F2FE',
            background: 'rgba(8, 11, 24, 0.85)',
            padding: '0.22rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(147, 197, 253, 0.25)',
            maxWidth: 'calc(100% - 24px)',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          ✦ Tap whale to sing • Drag water for gentle ripples
        </div>
      </div>

      {/* 3 Interactive Whale Song & Acoustic Call Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.45rem',
          width: '100%',
        }}
      >
        {/* Deep 52-Hz Call */}
        <button
          type="button"
          onClick={() => handleWhaleSong('deep')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.65rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isSinging && activeCallType === 'deep'
              ? 'rgba(6, 182, 212, 0.35)'
              : 'linear-gradient(135deg, rgba(30, 58, 138, 0.28) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: isSinging && activeCallType === 'deep' ? '1.5px solid rgba(103, 232, 249, 0.8)' : '1px solid rgba(56, 189, 248, 0.45)',
            color: '#A5F3FC',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: isSinging && activeCallType === 'deep' ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
          }}
        >
          <Waves size={16} color="#38BDF8" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>52-Hz Call</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.7)' }}>Deep Oceanic Rumble</span>
        </button>

        {/* Melodic Humpback Echo */}
        <button
          type="button"
          onClick={() => handleWhaleSong('melodic')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.65rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isSinging && activeCallType === 'melodic'
              ? 'rgba(168, 85, 247, 0.35)'
              : 'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)',
            border: isSinging && activeCallType === 'melodic' ? '1.5px solid #C084FC' : '1px solid rgba(168, 85, 247, 0.45)',
            color: '#E9D5FF',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: isSinging && activeCallType === 'melodic' ? '0 0 16px rgba(168, 85, 247, 0.4)' : 'none',
          }}
        >
          <Sparkles size={16} color="#C084FC" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Melodic Hymn</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.7)' }}>Ascending Echo</span>
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
            padding: '0.65rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isSurfacing
              ? 'rgba(14, 165, 233, 0.35)'
              : 'linear-gradient(135deg, rgba(14, 116, 144, 0.28) 0%, rgba(56, 189, 248, 0.15) 100%)',
            border: isSurfacing ? '1.5px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.45)',
            color: '#BAE6FD',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: isSurfacing ? '0 0 16px rgba(14, 165, 233, 0.4)' : 'none',
          }}
        >
          <Wind size={16} color="#BAE6FD" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Blowhole Spout</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.7)' }}>Surface & Click Train</span>
        </button>
      </div>

      {/* Whale Lore & Emotional Connection Card */}
      <div
        style={{
          width: '100%',
          padding: '1.15rem 1.35rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(10, 15, 30, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
          <Heart size={15} color="#38BDF8" fill="#38BDF8" />
          <h4
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.12rem',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            The 52-Hertz Whale & You
          </h4>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.84rem',
            lineHeight: 1.62,
            color: 'var(--color-ivory-dim)',
            margin: '0 0 0.65rem 0',
          }}
        >
          Blue whales sing at frequencies that penetrate hundreds of miles of ocean water without fading. No matter how deep the silence or how wide the distance across Tamil Nadu feels at 3 AM, my thoughts and love travel straight across the tides to reach you.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.55rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#38BDF8',
          }}
        >
          <span>BAY OF BENGAL ⇄ MARINA COAST</span>
          <span>SONGS SUNG: {songCount} ✦</span>
        </div>
      </div>
    </div>
  );
};

export default OceanBeach;

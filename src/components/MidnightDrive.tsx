import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Lightbulb, Wind, Sparkles, Camera, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const MidnightDrive: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [highBeams, setHighBeams] = useState(true);
  const [speed, setSpeed] = useState(82); // km/h
  const [showPassengerCam, setShowPassengerCam] = useState(true);
  const [isCamModalOpen, setIsCamModalOpen] = useState(false);
  const [isCamMuted, setIsCamMuted] = useState(false);
  const [isCamPlaying, setIsCamPlaying] = useState(true);
  const [camProgress, setCamProgress] = useState(0);
  const [modalDims, setModalDims] = useState<{ w: number; h: number }>({ w: 420, h: 236 });
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isCamModalOpen) return;
    const updateDims = () => {
      if (modalContainerRef.current) {
        const rect = modalContainerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setModalDims({ w: rect.width, h: rect.height });
        }
      }
    };
    updateDims();
    const id = requestAnimationFrame(updateDims);
    window.addEventListener('resize', updateDims);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', updateDims);
    };
  }, [isCamModalOpen]);

  const togglePlayModalVideo = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsCamPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsCamPlaying(false);
    }
  };

  const toggleMuteModalVideo = () => {
    setIsCamMuted((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (!modalVideoRef.current) return;
    const cur = modalVideoRef.current.currentTime;
    const dur = modalVideoRef.current.duration;
    if (dur > 0) {
      setCamProgress((cur / dur) * 100);
    }
  };

  // Audio synthesis: Warm coastal breeze & asphalt hum
  const playBeamsClick = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(300, now + 0.05);
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

  // Canvas Highway Simulation
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
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.04;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const horizonY = h * 0.45;

      ctx.clearRect(0, 0, w, h);

      // 1. Midnight Sky & Distant Mountain Silhouettes
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, '#060814');
      sky.addColorStop(1, '#111827');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, horizonY);

      // Distant rolling hills
      ctx.fillStyle = '#0a0e1c';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.bezierCurveTo(w * 0.3, horizonY - 25, w * 0.7, horizonY - 15, w, horizonY - 30);
      ctx.lineTo(w, horizonY);
      ctx.closePath();
      ctx.fill();

      // Giant Moon
      ctx.beginPath();
      ctx.arc(w * 0.75, horizonY - 45, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#FDE68A';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2. Asphalt Road Surface
      const road = ctx.createLinearGradient(0, horizonY, 0, h);
      road.addColorStop(0, '#11131c');
      road.addColorStop(1, '#080a12');
      ctx.fillStyle = road;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Road Perspective Edges
      const vpX = w * 0.5;
      const roadBottomLeft = -w * 0.1;
      const roadBottomRight = w * 1.1;

      ctx.fillStyle = '#1e2333';
      ctx.beginPath();
      ctx.moveTo(vpX - 10, horizonY);
      ctx.lineTo(vpX + 10, horizonY);
      ctx.lineTo(roadBottomRight, h);
      ctx.lineTo(roadBottomLeft, h);
      ctx.closePath();
      ctx.fill();

      // Headlight Beam Illumination Cone
      if (highBeams) {
        const beam = ctx.createRadialGradient(vpX, h, 20, vpX, horizonY, h * 0.7);
        beam.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
        beam.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
        beam.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(vpX - 15, horizonY);
        ctx.lineTo(vpX + 15, horizonY);
        ctx.lineTo(roadBottomRight * 0.8, h);
        ctx.lineTo(roadBottomLeft * 0.8, h);
        ctx.closePath();
        ctx.fill();
      }

      // Moving Dashed Center Line
      const dashCount = 8;
      for (let i = 0; i < dashCount; i++) {
        const progress = ((i + (t % 1)) / dashCount);
        const y = horizonY + Math.pow(progress, 2.2) * (h - horizonY);
        const nextProgress = ((i + 0.5 + (t % 1)) / dashCount);
        const nextY = horizonY + Math.pow(nextProgress, 2.2) * (h - horizonY);

        const width = progress * 6 + 1;
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(vpX - width / 2, y, width, Math.max(2, nextY - y));
      }

      // Streetlights drifting past on left side
      const lightCount = 4;
      for (let i = 0; i < lightCount; i++) {
        const p = ((i + (t * 0.7) % 1) / lightCount);
        const ly = horizonY + Math.pow(p, 2) * (h - horizonY);
        const lx = vpX - (vpX - roadBottomLeft) * p * 0.95;

        // Streetlamp glow
        ctx.beginPath();
        ctx.arc(lx, ly - p * 30, Math.max(2, p * 8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${p * 0.85})`;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [highBeams]);

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
      {/* 2D Windshield Simulation Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#080B18',
          border: '1.5px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Top HUD: Speed & Direction */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8, 11, 24, 0.8)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            color: 'var(--color-ivory)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={13} color="var(--color-lavender)" />
            <span>HEADING: COASTAL HWY • 82 KM/H</span>
          </div>
          <div style={{ color: '#FDE68A' }}>02:15 AM</div>
        </div>

        {/* Dashboard Steering Silhouette at Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160px',
            height: '65px',
            borderRadius: '40px 40px 0 0',
            background: 'linear-gradient(180deg, #161a2e 0%, #080b18 100%)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 -4px 15px rgba(0,0,0,0.8)',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
            ✦ BOT & YOU ✦
          </span>
        </div>

        {/* Floating Passenger Seat Live Cam HUD - Horizontal Widescreen */}
        {showPassengerCam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsCamModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '14px',
              width: '142px',
              height: '84px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1.5px solid rgba(56, 189, 248, 0.75)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.35)',
              background: '#04060E',
              cursor: 'pointer',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Passenger Seat • Bot (Tap to expand)"
          >
            {/* Centered 90-degree rotated video to display upright horizontally */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                src="/memories/VID_20260901_105722_311.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '84px',
                  height: '149px',
                  transform: 'rotate(90deg)',
                  transformOrigin: 'center center',
                  objectFit: 'cover',
                  flexShrink: 0,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Car Dashboard Quick Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => {
            playBeamsClick();
            setHighBeams(!highBeams);
          }}
          style={{
            flex: '1 1 120px',
            padding: '0.65rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: highBeams ? 'rgba(253, 230, 138, 0.22)' : 'rgba(14, 18, 36, 0.6)',
            border: `1.5px solid ${highBeams ? '#FDE68A' : 'rgba(216, 204, 255, 0.12)'}`,
            color: highBeams ? '#FDE68A' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <Lightbulb size={14} />
          <span>{highBeams ? 'High Beams ON' : 'Low Beams'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playBeamsClick();
            setSpeed(speed === 82 ? 105 : 82);
          }}
          style={{
            flex: '1 1 140px',
            padding: '0.65rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: speed > 82 ? 'rgba(244, 114, 182, 0.22)' : 'rgba(14, 18, 36, 0.6)',
            border: `1.5px solid ${speed > 82 ? '#F472B6' : 'rgba(216, 204, 255, 0.12)'}`,
            color: speed > 82 ? '#F472B6' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <Wind size={14} />
          <span>{speed > 82 ? 'Windows Down • 105 km/h' : 'Cruising • 82 km/h'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPassengerCam(!showPassengerCam)}
          style={{
            flex: '1 1 140px',
            padding: '0.65rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: showPassengerCam ? 'rgba(56, 189, 248, 0.22)' : 'rgba(14, 18, 36, 0.6)',
            border: `1.5px solid ${showPassengerCam ? '#38BDF8' : 'rgba(216, 204, 255, 0.12)'}`,
            color: showPassengerCam ? '#38BDF8' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <Camera size={14} />
          <span>{showPassengerCam ? 'Passenger Cam ON' : 'Passenger Cam OFF'}</span>
        </button>
      </div>

      {/* Expanded Passenger Cam Modal with Audio - Horizontal Widescreen */}
      <AnimatePresence>
        {isCamModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCamModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(4, 6, 14, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '24px',
                background: 'linear-gradient(180deg, #0F142D 0%, #080A18 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(56, 189, 248, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#34D399',
                        boxShadow: '0 0 8px #34D399',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                      PASSENGER SEAT 02 • LIVE CAM ✦
                    </span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', color: '#FFFFFF', margin: '0.15rem 0 0 0', fontSize: '1.15rem' }}>
                    Roadtrip Songs & Those Eyes
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCamModalOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Close Passenger Cam"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Horizontal 16:9 Video Player View */}
              <div
                ref={modalContainerRef}
                onClick={togglePlayModalVideo}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#020308',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Rotated video perfectly sized to fill horizontal 16:9 upright */}
                <video
                  ref={modalVideoRef}
                  src="/memories/VID_20260901_105722_311.mp4"
                  autoPlay
                  loop
                  playsInline
                  muted={isCamMuted}
                  onTimeUpdate={handleTimeUpdate}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${modalDims.h}px`,
                    height: `${modalDims.w}px`,
                    transform: 'translate(-50%, -50%) rotate(90deg)',
                    transformOrigin: 'center center',
                    objectFit: 'cover',
                  }}
                />

                {/* Subtle vignette border */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.5) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Large center Play indicator when paused */}
                {!isCamPlaying && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      position: 'absolute',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.75)',
                      border: '1.5px solid rgba(56, 189, 248, 0.8)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8',
                      boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
                      zIndex: 3,
                    }}
                  >
                    <Play size={24} style={{ marginLeft: '3px' }} />
                  </motion.div>
                )}

                {/* Custom Overlay Controls: Play/Pause, Sound Toggle, Live Badge */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0.6rem 0.9rem',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    zIndex: 4,
                  }}
                >
                  {/* Progress Line */}
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${camProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
                        borderRadius: '2px',
                        transition: 'width 0.1s linear',
                      }}
                    />
                  </div>

                  {/* Buttons Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={togglePlayModalVideo}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '0.35rem 0.55rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        {isCamPlaying ? <Pause size={13} /> : <Play size={13} />}
                        <span>{isCamPlaying ? 'Pause' : 'Play'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleMuteModalVideo}
                        style={{
                          background: isCamMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)',
                          border: `1px solid ${isCamMuted ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)'}`,
                          color: isCamMuted ? '#FCA5A5' : '#7DD3FC',
                          padding: '0.35rem 0.55rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        {isCamMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{isCamMuted ? 'Muted' : 'Audio ON'}</span>
                      </button>
                    </div>

                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.65)',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                      }}
                    >
                      1080P WIDESCREEN ✦
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div style={{ padding: '0.9rem 1.25rem 1.1rem 1.25rem' }}>
                <p style={{ color: 'var(--color-ivory)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "Earphones in, the highway wind rushing past, and the road ahead. Sitting right beside you is the only place I ever want to be."
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Late-Night Road Story */}
      <div
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-gold-soft)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <Sparkles size={14} />
          <span>The Passenger Seat</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Someday soon, when our worlds finally meet, this won't be on a screen. It'll be 2 AM, the coastal air cold against our hands, music playing from the stereo, and you sitting right beside me. We won't need anywhere special to go — just driving into the quiet night together.
        </p>
      </div>
    </div>
  );
};

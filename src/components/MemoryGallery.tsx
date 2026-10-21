import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, MessageSquare, Smile, Feather, ChevronDown, Play, Maximize2, X, Volume2, VolumeX, Sparkles, Film } from 'lucide-react';
import { siteContent, MemoryItem } from '../data/siteContent';

type FilterCategory = 'all' | 'photos' | 'videos' | 'lore';

export const MemoryGallery: React.FC = () => {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [lightboxItem, setLightboxItem] = useState<MemoryItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getIcon = (type: MemoryItem['type'], mediaType?: string, color?: string) => {
    if (mediaType === 'video') return <Film size={18} color={color} />;
    switch (type) {
      case 'photo':
        return <Image size={18} color={color} />;
      case 'message':
        return <MessageSquare size={18} color={color} />;
      case 'joke':
        return <Smile size={18} color={color} />;
      case 'note':
      default:
        return <Feather size={18} color={color} />;
    }
  };

  const filteredMemories = siteContent.memories.filter((item) => {
    if (activeFilter === 'photos') return item.mediaType === 'image';
    if (activeFilter === 'videos') return item.mediaType === 'video';
    if (activeFilter === 'lore') return !item.mediaType;
    return true;
  });

  const photoCount = siteContent.memories.filter((m) => m.mediaType === 'image').length;
  const videoCount = siteContent.memories.filter((m) => m.mediaType === 'video').length;
  const loreCount = siteContent.memories.filter((m) => !m.mediaType).length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.4rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(15, 18, 38, 0.6)',
          border: '1px solid rgba(216, 204, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          maxWidth: '680px',
          margin: '0 auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: activeFilter === 'all' ? 'rgba(167, 139, 250, 0.25)' : 'transparent',
            border: activeFilter === 'all' ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid transparent',
            color: activeFilter === 'all' ? 'var(--color-ivory)' : 'var(--color-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          All Memories ({siteContent.memories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('videos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: activeFilter === 'videos' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
            border: activeFilter === 'videos' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
            color: activeFilter === 'videos' ? '#BAE6FD' : 'var(--color-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Film size={13} />
          <span>Living Video Clips ({videoCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('photos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: activeFilter === 'photos' ? 'rgba(253, 230, 138, 0.25)' : 'transparent',
            border: activeFilter === 'photos' ? '1px solid rgba(253, 230, 138, 0.5)' : '1px solid transparent',
            color: activeFilter === 'photos' ? 'var(--color-gold-soft)' : 'var(--color-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Image size={13} />
          <span>Her Portraits ({photoCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('lore')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: activeFilter === 'lore' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
            border: activeFilter === 'lore' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent',
            color: activeFilter === 'lore' ? '#FCA5A5' : 'var(--color-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={13} />
          <span>Our Lore & Inside Jokes ({loreCount})</span>
        </button>
      </div>

      {/* Grid of Memory Cards */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem',
          margin: '0.5rem 0',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredMemories.map((item) => {
            const isExpanded = selectedMemory === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  border: isExpanded
                    ? `1px solid ${item.accent}`
                    : '1px solid var(--color-border)',
                  boxShadow: isExpanded
                    ? `0 14px 35px rgba(0, 0, 0, 0.45), 0 0 25px ${item.accent}30`
                    : '0 8px 24px rgba(0, 0, 0, 0.35)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(180deg, rgba(16, 20, 42, 0.75) 0%, rgba(9, 12, 26, 0.85) 100%)',
                }}
              >
                <div>
                  {/* Top Bar with Icon & Tag Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        background: `${item.accent}15`,
                        border: `1px solid ${item.accent}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getIcon(item.type, item.mediaType, item.accent)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            color: item.accent,
                            background: `${item.accent}18`,
                            border: `1px solid ${item.accent}40`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            letterSpacing: '0.06em',
                            fontWeight: 600,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h4
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.28rem',
                      fontWeight: 600,
                      color: 'var(--color-ivory)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-muted)',
                      marginBottom: '0.85rem',
                    }}
                  >
                    {item.subtitle}
                  </p>

                  {/* MEDIA PREVIEW SECTION (Video or Image) */}
                  {item.mediaType === 'video' && item.videoPath ? (
                    <div
                      onClick={() => setLightboxItem(item)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '180px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        marginBottom: '0.9rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: '#04060E',
                      }}
                    >
                      <video
                        src={item.videoPath}
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(0.92)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, transparent 50%, rgba(5, 7, 16, 0.85) 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            color: '#FFFFFF',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          {item.duration || 'CLIP'}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.72rem',
                            color: item.accent,
                            fontWeight: 600,
                          }}
                        >
                          <Play size={12} fill={item.accent} />
                          <span>{item.hasAudio ? 'Tap for Sound' : 'Tap to Expand'}</span>
                        </div>
                      </div>
                    </div>
                  ) : item.imagePath ? (
                    <div
                      onClick={() => setLightboxItem(item)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '180px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        marginBottom: '0.9rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: '#04060E',
                      }}
                    >
                      <img
                        src={item.imagePath}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          padding: '0.3rem',
                          borderRadius: '50%',
                          background: 'rgba(0, 0, 0, 0.55)',
                          backdropFilter: 'blur(6px)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Maximize2 size={13} />
                      </div>
                    </div>
                  ) : null}

                  {/* Snippet Quote */}
                  <p
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: 'var(--color-ivory-dim)',
                      fontStyle: 'italic',
                      marginBottom: '0.5rem',
                    }}
                  >
                    "{item.snippet}"
                  </p>
                </div>

                {/* Revealed Personal Note Accordion */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    onClick={() => setSelectedMemory(isExpanded ? null : item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      color: item.accent,
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '0.2rem 0',
                    }}
                  >
                    <span>{isExpanded ? 'Hide private note' : 'Read personal note'}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            marginTop: '0.65rem',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(7, 9, 20, 0.85)',
                            border: `1px solid ${item.accent}30`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: '0.86rem',
                              lineHeight: 1.65,
                              color: 'var(--color-ivory)',
                              margin: 0,
                            }}
                          >
                            {item.revealedNote}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FULLSCREEN CINEMA LIGHTBOX FOR HIGH-RES PHOTOS & VIDEOS */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(4, 6, 14, 0.94)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(1rem, 3vw, 2.5rem)',
              boxSizing: 'border-box',
            }}
            onClick={() => setLightboxItem(null)}
          >
            {/* Modal Dialog Card */}
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, #0E1229 0%, #070914 100%)',
                borderRadius: '24px',
                border: `1px solid ${lightboxItem.accent}50`,
                boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px ${lightboxItem.accent}25`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top Header with Close Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: lightboxItem.accent,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {lightboxItem.badge || 'MEMORIES ARCHIVE'}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      color: 'var(--color-ivory)',
                      margin: '0.15rem 0 0 0',
                    }}
                  >
                    {lightboxItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--color-ivory)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Close cinema view"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Media Player Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  background: '#020308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '280px',
                  maxHeight: '480px',
                  overflow: 'hidden',
                }}
              >
                {lightboxItem.mediaType === 'video' && lightboxItem.videoPath ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    <video
                      src={lightboxItem.videoPath}
                      controls
                      autoPlay
                      muted={!lightboxItem.hasAudio || isMuted}
                      loop
                      playsInline
                      style={{
                        maxHeight: '440px',
                        width: 'auto',
                        maxWidth: '100%',
                        borderRadius: '8px',
                      }}
                    />
                    {lightboxItem.hasAudio ? (
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(10, 13, 28, 0.85)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '0.76rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                      </button>
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(10, 13, 28, 0.75)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'var(--color-muted)',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}
                      >
                        <VolumeX size={13} />
                        <span>Silent visual memory</span>
                      </div>
                    )}
                  </div>
                ) : lightboxItem.imagePath ? (
                  <img
                    src={lightboxItem.imagePath}
                    alt={lightboxItem.title}
                    style={{
                      maxHeight: '460px',
                      maxWidth: '100%',
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                ) : null}
              </div>

              {/* Story & Note Section */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <p
                  style={{
                    fontSize: '0.98rem',
                    lineHeight: 1.6,
                    color: 'var(--color-ivory)',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  "{lightboxItem.snippet}"
                </p>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(167, 139, 250, 0.08)',
                    border: `1px solid ${lightboxItem.accent}35`,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: lightboxItem.accent,
                      letterSpacing: '0.08em',
                      marginBottom: '0.35rem',
                      fontWeight: 600,
                    }}
                  >
                    PERSONAL NOTE ✦
                  </span>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      color: 'var(--color-ivory)',
                      margin: 0,
                    }}
                  >
                    {lightboxItem.revealedNote}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

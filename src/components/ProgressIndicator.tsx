import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, X, Star } from 'lucide-react';

interface ProgressIndicatorProps {
  currentChapter: number;
  totalChapters: number;
  chapterNames: string[];
  onSelectChapter: (index: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentChapter,
  totalChapters,
  chapterNames,
  onSelectChapter,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelect = (index: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Safe fallback
      }
    }
    onSelectChapter(index);
    setIsDrawerOpen(false);
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      handleSelect(currentChapter - 1);
    }
  };

  const handleNext = () => {
    if (currentChapter < totalChapters - 1) {
      handleSelect(currentChapter + 1);
    }
  };

  return (
    <>
      {/* Compact Floating Navigation Controller */}
      <nav
        aria-label="Experience chapter navigation"
        style={{
          position: 'fixed',
          bottom: 'max(0.85rem, env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 45,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.28rem 0.45rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(8, 12, 26, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65), 0 0 16px rgba(167, 139, 250, 0.15)',
          touchAction: 'manipulation',
          userSelect: 'none',
        }}
      >
        {/* Previous Chapter Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentChapter === 0}
          title="Previous Chapter"
          aria-label="Previous Chapter"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: currentChapter === 0 ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentChapter === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Center Chapter Trigger: Opens Chapter List Drawer */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          title="Open Chapter Index"
          aria-label="Open Chapter Index"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(167, 139, 250, 0.14)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            color: 'var(--color-ivory)',
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <List size={13} color="var(--color-lavender)" />
          <span>
            {String(currentChapter + 1).padStart(2, '0')} / {String(totalChapters).padStart(2, '0')}
          </span>
          <span
            style={{
              maxWidth: '85px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--color-lilac)',
              fontWeight: 400,
              fontSize: '0.7rem',
              display: 'inline-block',
            }}
            className="chapter-pill-name"
          >
            {chapterNames[currentChapter]}
          </span>
        </button>

        {/* Next Chapter Arrow */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentChapter === totalChapters - 1}
          title="Next Chapter"
          aria-label="Next Chapter"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: currentChapter === totalChapters - 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentChapter === totalChapters - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </nav>

      {/* Chapter Index Bottom Sheet Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(4, 6, 14, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '520px',
                margin: '0 auto',
                background: 'linear-gradient(180deg, #10142A 0%, #080A16 100%)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                borderTop: '1.5px solid rgba(167, 139, 250, 0.45)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 -15px 50px rgba(0, 0, 0, 0.8)',
                paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                maxHeight: '82svh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem 1.35rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-lavender)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                    JOURNEY INDEX ✦
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFFFFF', fontSize: '1.15rem', margin: '0.15rem 0 0 0' }}>
                    All {totalChapters} Chapters
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Chapter List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                {chapterNames.map((name, index) => {
                  const isActive = index === currentChapter;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.22) 0%, rgba(147, 197, 253, 0.12) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isActive
                          ? '1.5px solid rgba(167, 139, 250, 0.65)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#FFFFFF' : 'var(--color-ivory)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            color: isActive ? 'var(--color-lavender)' : 'var(--color-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? '#FFFFFF' : 'var(--color-ivory-dim)',
                          }}
                        >
                          {name}
                        </span>
                      </div>

                      {isActive && <Star size={14} color="#FDE68A" fill="#FDE68A" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

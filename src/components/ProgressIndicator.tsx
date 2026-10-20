import React from 'react';
import { motion } from 'framer-motion';

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
  return (
    <nav
      aria-label="Experience chapter navigation"
      style={{
        position: 'fixed',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.45rem 0.95rem',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(14, 18, 36, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(216, 204, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {Array.from({ length: totalChapters }).map((_, index) => {
          const isActive = index === currentChapter;
          const isPassed = index < currentChapter;

          return (
            <button
              key={index}
              onClick={() => onSelectChapter(index)}
              title={`Go to Chapter ${index + 1}: ${chapterNames[index] || ''}`}
              aria-label={`Chapter ${index + 1} of ${totalChapters}: ${chapterNames[index]}`}
              aria-current={isActive ? 'step' : undefined}
              style={{
                width: isActive ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: isActive
                  ? 'var(--color-lavender)'
                  : isPassed
                  ? 'rgba(216, 204, 255, 0.45)'
                  : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                border: 'none',
                padding: 0,
                position: 'relative',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="activePillGlow"
                  style={{
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '6px',
                    background: 'rgba(167, 139, 250, 0.35)',
                    filter: 'blur(2px)',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <span
        style={{
          fontSize: '0.74rem',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.05em',
          color: 'var(--color-muted)',
          marginLeft: '0.35rem',
          userSelect: 'none',
        }}
      >
        <span style={{ color: 'var(--color-ivory)', fontWeight: 500 }}>
          {String(currentChapter + 1).padStart(2, '0')}
        </span>
        <span style={{ opacity: 0.5 }}> / {String(totalChapters).padStart(2, '0')}</span>
      </span>
    </nav>
  );
};

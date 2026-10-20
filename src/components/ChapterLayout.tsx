import React from 'react';
import { motion } from 'framer-motion';

interface ChapterLayoutProps {
  id: string;
  chapterNumber: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  align?: 'center' | 'left';
  maxWidth?: string;
}

export const ChapterLayout: React.FC<ChapterLayoutProps> = ({
  id,
  chapterNumber: _chapterNumber,
  eyebrow,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  align = 'center',
  maxWidth = '760px',
}) => {
  return (
    <motion.section
      key={id}
      id={id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'max(4.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 4.5rem))',
        paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : 'flex-start',
          textAlign: align,
        }}
      >
        {/* Eyebrow Label */}
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="eyebrow"
          >
            {eyebrow}
          </motion.div>
        )}

        {/* Heading */}
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="heading-chapter"
            style={{ marginBottom: subtitle ? '1.2rem' : '1.8rem' }}
          >
            {title}
          </motion.h2>
        )}

        {/* Subtitle / Supporting copy */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="body-lead"
            style={{
              maxWidth: '640px',
              marginBottom: '2.4rem',
              whiteSpace: 'pre-line',
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Chapter Dynamic Interactive Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.55 }}
          style={{ width: '100%', position: 'relative' }}
        >
          {children}
        </motion.div>

        {/* Action Controls */}
        {(primaryAction || secondaryAction) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: align === 'center' ? 'center' : 'flex-start',
              marginTop: '2.8rem',
            }}
          >
            {primaryAction && (
              <button
                type="button"
                className="btn-primary"
                onClick={primaryAction.onClick}
                aria-label={primaryAction.label}
              >
                <span>{primaryAction.label}</span>
                {primaryAction.icon}
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                className="btn-secondary"
                onClick={secondaryAction.onClick}
                aria-label={secondaryAction.label}
              >
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

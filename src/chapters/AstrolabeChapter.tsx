import React from 'react';
import { motion } from 'framer-motion';
import { ChapterLayout } from '../components/ChapterLayout';
import { CelestialAstrolabe } from '../components/CelestialAstrolabe';
import { ArrowRight } from 'lucide-react';

interface AstrolabeChapterProps {
  onProceed: () => void;
}

export const AstrolabeChapter: React.FC<AstrolabeChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-astrolabe"
      chapterNumber={3}
      eyebrow="CHAPTER 03 • THE DUAL HORIZON"
      title="Two Coordinates, One Shared Sky"
      subtitle="An antique astronomical astrolabe that maps the night sky above both our cities."
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            maxWidth: '520px',
            color: 'var(--color-starlight-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.94rem',
            lineHeight: 1.65,
            margin: '0 auto',
          }}
        >
          Even though miles separate our physical locations, we are anchored to the very same revolving celestial dome.
          Drag the brass pointer arm around the degree scale to trace the stars, or scrub the time slider to travel from sunset to deep night.
        </motion.p>

        {/* The Interactive Astrolabe Instrument */}
        <CelestialAstrolabe />

        {/* Continue Button */}
        <motion.button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(15); } catch {}
            }
            onProceed();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(251, 191, 36, 0.25) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.45)',
            color: 'var(--color-ivory)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
          }}
        >
          <span>Continue to The Drop Zone</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </ChapterLayout>
  );
};

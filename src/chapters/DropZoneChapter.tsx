import React from 'react';
import { motion } from 'framer-motion';
import { ChapterLayout } from '../components/ChapterLayout';
import { CelestialAMR } from '../components/CelestialAMR';
import { ArrowRight } from 'lucide-react';

interface DropZoneChapterProps {
  onProceed: () => void;
}

export const DropZoneChapter: React.FC<DropZoneChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-drop-zone"
      chapterNumber={4}
      eyebrow="CHAPTER 04 • THE ORIGIN IN THE ZONE"
      title="Where Our Worlds First Dropped"
      subtitle="Before everything else, there was a match, an airdrop, and the best teammate in the world."
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
          We didn't meet through a regular introduction. We met in the chaos of BGMI — running from the blue zone,
          sharing loot, and laughing through late-night lobbies. Here is an airdrop called in just for your birthday,
          equipped with your favorite AMR.
        </motion.p>

        {/* The Interactive Airdrop & AMR Component */}
        <CelestialAMR />

        {/* Continue Button */}
        <motion.button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(15);
              } catch {
                // Safe fallback
              }
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
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(251, 191, 36, 0.25) 100%)',
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
          <span>Continue to The Little Things</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </ChapterLayout>
  );
};

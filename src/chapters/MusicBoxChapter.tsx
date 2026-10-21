import React from 'react';
import { motion } from 'framer-motion';
import { ChapterLayout } from '../components/ChapterLayout';
import { CelestialMusicBox } from '../components/CelestialMusicBox';
import { ArrowRight } from 'lucide-react';

interface MusicBoxChapterProps {
  onProceed: () => void;
}

export const MusicBoxChapter: React.FC<MusicBoxChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-music-box"
      chapterNumber={12}
      eyebrow="CHAPTER 12 • THE CELESTIAL MUSIC BOX"
      title="The Celestial Music Box"
      subtitle="Hand-turned brass cylinder • Tuned steel comb • Starlight chime"
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
          An antique music box forged in starlight, made especially for your birthday. Turn the brass key to wind
          the mainspring, then release the lever to hear the chime.
        </motion.p>

        {/* The Interactive Music Box */}
        <CelestialMusicBox />

        {/* Navigation Continue Button */}
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
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)',
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
          <span>Continue to Voice Message</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </ChapterLayout>
  );
};

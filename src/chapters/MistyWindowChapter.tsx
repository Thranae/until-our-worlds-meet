import React from 'react';
import { motion } from 'framer-motion';
import { ChapterLayout } from '../components/ChapterLayout';
import { MistyWindow } from '../components/MistyWindow';
import { ArrowRight } from 'lucide-react';

interface MistyWindowChapterProps {
  onProceed: () => void;
}

export const MistyWindowChapter: React.FC<MistyWindowChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-misty-window"
      chapterNumber={9}
      eyebrow="CHAPTER 09 • THE MIDNIGHT WINDOW"
      title="The Misty Midnight Window"
      subtitle="02:00 AM • Wipe the dew off the glass to look into the night"
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
          Whenever the quiet hours arrive and sleep feels far away, the glass gathers cold mist from the night.
          Wipe a circle with your finger to look through to the horizon.
        </motion.p>

        {/* The Interactive Fogged Window Component */}
        <MistyWindow />

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
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25) 0%, rgba(253, 230, 138, 0.25) 100%)',
            border: '1px solid rgba(253, 230, 138, 0.4)',
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
          <span>Weave the Northern Lights ✦</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </ChapterLayout>
  );
};

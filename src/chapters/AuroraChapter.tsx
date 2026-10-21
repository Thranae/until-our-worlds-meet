import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { AuroraSky } from '../components/AuroraSky';

interface AuroraChapterProps {
  onProceed: () => void;
}

export const AuroraChapter: React.FC<AuroraChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-aurora-sky"
      chapterNumber={15}
      eyebrow="CHAPTER 15 • THE AURORA VEIL • CHILDREN OF LIGHT"
      title="Ribbons of light across the night sky"
      subtitle="Two children of light sitting on a celestial cliff, wrapped in warm cloaks, watching the Northern Lights ripple across the clouds together. Tap to call out across the sky, light the red friendship candle, and weave auroras between Coimbatore and Chennai."
      primaryAction={{
        label: 'The midnight drive next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <AuroraSky />
    </ChapterLayout>
  );
};

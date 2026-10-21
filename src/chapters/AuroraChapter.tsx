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
      eyebrow="CHAPTER 15 • THE AURORA VEIL • NORDIC FJORD NIGHT"
      title="Ribbons of light across the night sky"
      subtitle="Two souls sitting side by side on a Scandinavian cliff under the Arctic night sky. The Northern Lights appear only when the candle is lit and your hands are held tight together. Let go, and the sky quietly sleeps."
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

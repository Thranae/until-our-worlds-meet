import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { TheSafeZone } from '../components/TheSafeZone';

interface SafeZoneChapterProps {
  onProceed: () => void;
}

export const SafeZoneChapter: React.FC<SafeZoneChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-safe-zone"
      chapterNumber={6}
      eyebrow="CHAPTER 06 • THE FINAL CIRCLE"
      title="In a world of noise, you became my safe zone"
      subtitle="Out of 100 players in every lobby and billions in the world, the only circle that ever truly mattered was right beside you."
      primaryAction={{
        label: 'Look through the 8x scope ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <TheSafeZone />
    </ChapterLayout>
  );
};

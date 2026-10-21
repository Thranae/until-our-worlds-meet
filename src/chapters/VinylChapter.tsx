import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { VinylRecordPlayer } from '../components/VinylRecordPlayer';

interface VinylChapterProps {
  onProceed: () => void;
}

export const VinylChapter: React.FC<VinylChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-vinyl-player"
      chapterNumber={14}
      eyebrow="CHAPTER 14 • THE 3 AM TURNTABLE"
      title="The soundtrack spinning through the dark"
      subtitle="03:00 AM • Drop the needle onto the vinyl grooved disc to hear our late-night melody."
      primaryAction={{
        label: 'Northern Lights across the sky ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <VinylRecordPlayer />
    </ChapterLayout>
  );
};

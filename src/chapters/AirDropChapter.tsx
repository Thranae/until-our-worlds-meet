import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { AirDropCrate } from '../components/AirDropCrate';

interface AirDropChapterProps {
  onProceed: () => void;
}

export const AirDropChapter: React.FC<AirDropChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-air-drop"
      chapterNumber={8}
      eyebrow="CHAPTER 08 • THE CARE PACKAGE"
      title="A special supply crate from the sky"
      subtitle="Smoke flares popping in red and blue • Pull the latch to uncover custom rations packed just for you."
      primaryAction={{
        label: 'Feel our heartbeat next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <AirDropCrate />
    </ChapterLayout>
  );
};

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { GalaxyProjector } from '../components/GalaxyProjector';

interface GalaxyProjectorChapterProps {
  onProceed: () => void;
}

export const GalaxyProjectorChapter: React.FC<GalaxyProjectorChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-starlit-ceiling"
      chapterNumber={15}
      eyebrow="CHAPTER 15 • OUR STARLIT CEILING"
      title="A private galaxy on the ceiling"
      subtitle="02:30 AM • Lights off, projector on, and the distance between our rooms completely disappears."
      primaryAction={{
        label: 'Northern Lights across the sky ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <GalaxyProjector />
    </ChapterLayout>
  );
};

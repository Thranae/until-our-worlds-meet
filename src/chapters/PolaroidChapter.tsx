import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { PolaroidScrapbook } from '../components/PolaroidScrapbook';

interface PolaroidChapterProps {
  onProceed: () => void;
}

export const PolaroidChapter: React.FC<PolaroidChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-polaroid"
      chapterNumber={10}
      eyebrow="CHAPTER 10 • THE STARLIT DARKROOM"
      title="A Memory Frozen in Silver"
      subtitle={`Some moments belong on real film. Tap to snap and eject our instant keepsake, wipe your finger to develop the starlight emulsion, and flip it over to read the silver ink on the back.`}
      primaryAction={{
        label: 'The celestial music box ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="720px"
    >
      <PolaroidScrapbook />
    </ChapterLayout>
  );
};

export default PolaroidChapter;

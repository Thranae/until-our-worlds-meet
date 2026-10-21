import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { StarlightJar } from '../components/StarlightJar';

interface StarlightJarChapterProps {
  onProceed: () => void;
}

export const StarlightJarChapter: React.FC<StarlightJarChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-starlight-jar"
      chapterNumber={9}
      eyebrow="CHAPTER 09 • THE STARLIGHT BOTTLE"
      title="Catching Starlight for You"
      subtitle={`Every time you made me smile or laugh across the miles, I caught a little piece of light. Tap the glass to watch the fireflies dance, pop the wooden cork, and release our memories into the sky.`}
      primaryAction={{
        label: 'The celestial chime ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="740px"
    >
      <StarlightJar />
    </ChapterLayout>
  );
};

export default StarlightJarChapter;

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { CelestialRedBull } from '../components/CelestialRedBull';

interface RedBullChapterProps {
  onProceed: () => void;
}

export const RedBullChapter: React.FC<RedBullChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-celestial-redbull"
      chapterNumber={10}
      eyebrow="CHAPTER 10 • HER STARLIGHT FUEL"
      title="Pop the tab on your celestial can"
      subtitle="For every demanding night you pushed through hardship to earn your independence and build your future: here is your unlimited custom Red Bull edition."
      primaryAction={{
        label: 'View our living memories next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <CelestialRedBull />
    </ChapterLayout>
  );
};

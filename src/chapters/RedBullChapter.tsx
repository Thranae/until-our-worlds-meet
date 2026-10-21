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
      subtitle="For all the demanding study nights you conquered to graduate, and all the exciting new dreams ahead: here is your unlimited custom Red Bull edition."
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

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { CoffeeTogether } from '../components/CoffeeTogether';

interface CoffeeChapterProps {
  onProceed: () => void;
}

export const CoffeeChapter: React.FC<CoffeeChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-coffee-together"
      chapterNumber={21}
      eyebrow="CHAPTER 21 • TWO CUPS OF COFFEE"
      title="The warmth of sitting next to you"
      subtitle="Freshly brewed coffee on a quiet morning • Warm porcelain mugs, rich roasted aroma, and no more screens between us."
      primaryAction={{
        label: 'Open our future travel journal ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <CoffeeTogether />
    </ChapterLayout>
  );
};

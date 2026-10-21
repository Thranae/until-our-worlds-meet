import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { ChaiTogether } from '../components/ChaiTogether';

interface ChaiChapterProps {
  onProceed: () => void;
}

export const ChaiChapter: React.FC<ChaiChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-chai-together"
      chapterNumber={18}
      eyebrow="CHAPTER 18 • TWO CUPS OF CHAI"
      title="The warmth of sitting across from you"
      subtitle="Steaming tea on a rainy afternoon • Just two cups, warm hands, and no more screens between us."
      primaryAction={{
        label: 'Open our future travel journal ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <ChaiTogether />
    </ChapterLayout>
  );
};

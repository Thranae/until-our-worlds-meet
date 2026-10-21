import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { SniperScope } from '../components/SniperScope';

interface SniperScopeChapterProps {
  onProceed: () => void;
}

export const SniperScopeChapter: React.FC<SniperScopeChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-sniper-scope"
      chapterNumber={7}
      eyebrow="CHAPTER 07 • THE 8X OPTICAL LOCK"
      title="The sniper and her spotter"
      subtitle="Drag the 8x optical crosshair across the ridge to scan our memories and lock onto our secret marks."
      primaryAction={{
        label: 'Inspect the care package ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <SniperScope />
    </ChapterLayout>
  );
};

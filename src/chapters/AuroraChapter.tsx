import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { AuroraSky } from '../components/AuroraSky';

interface AuroraChapterProps {
  onProceed: () => void;
}

export const AuroraChapter: React.FC<AuroraChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-aurora-sky"
      chapterNumber={15}
      eyebrow="CHAPTER 15 • THE AURORA VEIL"
      title="Ribbons of light across the night sky"
      subtitle="Swipe across our midnight atmosphere to weave Northern Lights and cast shooting stars across the miles between us."
      primaryAction={{
        label: 'The midnight drive next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <AuroraSky />
    </ChapterLayout>
  );
};

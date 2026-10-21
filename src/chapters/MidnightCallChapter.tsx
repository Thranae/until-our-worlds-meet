import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { MidnightCall } from '../components/MidnightCall';

interface MidnightCallChapterProps {
  onProceed: () => void;
}

export const MidnightCallChapter: React.FC<MidnightCallChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-midnight-call"
      chapterNumber={11}
      eyebrow="CHAPTER 11 • THE 03:47 AM CALL"
      title="Falling asleep on call with you"
      subtitle="Those endless hours where nobody wants to say goodbye first, whispering until the sun comes up."
      primaryAction={{
        label: 'Tuning into midnight radio ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <MidnightCall />
    </ChapterLayout>
  );
};

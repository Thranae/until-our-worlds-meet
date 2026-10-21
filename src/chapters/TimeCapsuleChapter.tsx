import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { BirthdayTimeCapsule } from '../components/BirthdayTimeCapsule';

interface TimeCapsuleChapterProps {
  onProceed: () => void;
}

export const TimeCapsuleChapter: React.FC<TimeCapsuleChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-time-capsule"
      chapterNumber={24}
      eyebrow="CHAPTER 24 • THE NOVEMBER 8TH CAPSULE"
      title="The astronomical birthday vault"
      subtitle="Dial in the celestial combination: 08 • NOV • BOT to unlock our time capsule."
      primaryAction={{
        label: 'Weave our constellation ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <BirthdayTimeCapsule />
    </ChapterLayout>
  );
};

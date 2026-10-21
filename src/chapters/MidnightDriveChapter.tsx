import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { MidnightDrive } from '../components/MidnightDrive';

interface MidnightDriveChapterProps {
  onProceed: () => void;
}

export const MidnightDriveChapter: React.FC<MidnightDriveChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-midnight-drive"
      chapterNumber={16}
      eyebrow="CHAPTER 16 • THE MIDNIGHT DRIVE"
      title="The passenger seat under the stars"
      subtitle="02:15 AM • Empty highway, cool night breeze through the windows, and nowhere we have to rush."
      primaryAction={{
        label: 'Arrival Terminal ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <MidnightDrive />
    </ChapterLayout>
  );
};

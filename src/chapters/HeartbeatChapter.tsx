import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { HeartbeatSync } from '../components/HeartbeatSync';

interface HeartbeatChapterProps {
  onProceed: () => void;
}

export const HeartbeatChapter: React.FC<HeartbeatChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-heartbeat"
      chapterNumber={6}
      eyebrow="CHAPTER 06 • THE PULSE ACROSS MILES"
      title="Two Hearts, One Single Rhythm"
      subtitle={`Miles are only geographical coordinates on a map. Hold your thumb on the starlight biometric pad below to feel our synchronized heartbeat across the country.`}
      primaryAction={{
        label: 'The little things ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="720px"
    >
      <HeartbeatSync />
    </ChapterLayout>
  );
};

export default HeartbeatChapter;

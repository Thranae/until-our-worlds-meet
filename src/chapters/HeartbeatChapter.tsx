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
      chapterNumber={9}
      eyebrow="CHAPTER 09 • THE PULSE ACROSS MILES"
      title="Two Hearts, One Single Rhythm"
      subtitle={`Coimbatore and Chennai • ~500 km across Tamil Nadu, but miles are only numbers on a map. Hold your thumb on the starlight biometric pad below to feel our synchronized heartbeat across the state.`}
      primaryAction={{
        label: 'Pop the Red Bull can next ✦',
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

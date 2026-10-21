import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { AirportTerminal } from '../components/AirportTerminal';

interface AirportTerminalChapterProps {
  onProceed: () => void;
}

export const AirportTerminalChapter: React.FC<AirportTerminalChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-airport-terminal"
      chapterNumber={17}
      eyebrow="CHAPTER 17 • TERMINAL ✦ THE ARRIVAL"
      title="The arrival gate countdown"
      subtitle="The moment you walk through the sliding glass doors, put down your bags, and we never have to talk through a screen again."
      primaryAction={{
        label: 'Two cups of chai next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <AirportTerminal />
    </ChapterLayout>
  );
};

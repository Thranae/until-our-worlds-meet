import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { TravelJournal } from '../components/TravelJournal';

interface TravelJournalChapterProps {
  onProceed: () => void;
}

export const TravelJournalChapter: React.FC<TravelJournalChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-travel-journal"
      chapterNumber={19}
      eyebrow="CHAPTER 19 • THE FUTURE SCRAPBOOK"
      title="Every road trip we haven’t taken yet"
      subtitle="From high mountain passes in Ladakh to quiet street food stalls at midnight • Stamp each destination into our shared bucket list."
      primaryAction={{
        label: 'Wind the celestial music box ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <TravelJournal />
    </ChapterLayout>
  );
};

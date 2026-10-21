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
      chapterNumber={21}
      eyebrow="CHAPTER 21 • THE SACRED HIMALAYAN PILGRIMAGE"
      title="Ujjain Shivan Temple in the Snow-Covered Himalayas"
      subtitle="Perched high atop the snow-covered peaks among the clouds • Standing side-by-side in the gentle snowfall, hearing holy temple bells ring across the frozen mountain air, and seeking Mahadeva’s blessings together."
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

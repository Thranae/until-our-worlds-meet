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
      chapterNumber={22}
      eyebrow="CHAPTER 22 • THE SACRED PILGRIMAGE TO MAHAKALESHWAR"
      title="Sri Mahakaleshwar Jyotirlinga • Ujjain, Madhya Pradesh"
      subtitle="Holy Ujjain, Madhya Pradesh • Standing together before Mahadeva at dawn, seeking blessings for our journey and sealing our sacred pilgrimage."
      primaryAction={{
        label: 'Visit the Dutch tulip gardens ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <TravelJournal />
    </ChapterLayout>
  );
};

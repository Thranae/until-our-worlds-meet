import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { OceanBeach } from '../components/OceanBeach';

interface MarinaBeachChapterProps {
  onProceed: () => void;
}

export const MarinaBeachChapter: React.FC<MarinaBeachChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-marina-beach"
      chapterNumber={17}
      eyebrow="CHAPTER 17 • THE STARLIT OCEAN & THE BLUE WHALE"
      title="The Song of the Blue Whale Across the Tides"
      subtitle={`Marina Beach & the deep Bay of Bengal.\n\nBecause your favorite sea animal is the majestic Blue Whale — the gentle giant of the deep who sings songs that travel thousands of kilometers across the ocean to find the one it loves. No matter the distance across Tamil Nadu, every wave carries my heart straight to you.\n\n"Like the gentle song of the blue whale across the deep sea... my thoughts will always find their way to you ✦"`}
      primaryAction={{
        label: "Enter Mahadeva's sacred sanctuary ✦",
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <OceanBeach />
    </ChapterLayout>
  );
};

export default MarinaBeachChapter;

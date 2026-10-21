import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { ShivaSanctuary } from '../components/ShivaSanctuary';

interface ShivaChapterProps {
  onProceed: () => void;
}

export const ShivaChapter: React.FC<ShivaChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-lord-shiva"
      chapterNumber={18}
      eyebrow="CHAPTER 18 • THE SACRED SANCTUARY OF MAHADEVA"
      title="From Adiyogi to Mahakaleshwar"
      subtitle={`From the Velliangiri foothills in Coimbatore to the temple bell shores of Kapaleeshwarar in Chennai, and toward our cherished dream pilgrimage together to Ujjain Mahakaleshwar.\n\nBecause you love Lord Shiva with all your heart — here is a peaceful, sacred sanctuary under His crescent moon. Offer Bilva leaves, perform Ganga Jal abhishekam, light the deepam, and seek His eternal blessings for every step of your life.`}
      primaryAction={{
        label: 'The airport terminal arrival next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <ShivaSanctuary />
    </ChapterLayout>
  );
};

export default ShivaChapter;

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
      chapterNumber={19}
      eyebrow="CHAPTER 19 • THE SACRED SANCTUARY OF MAHADEVA"
      title="Tungnath in the Snowy Himalayas & Sacred Darshan"
      subtitle={`High at 3,680 meters in the snow-capped Garhwal Himalayas of Uttarakhand stands the ancient stone temple of Tungnath — the highest Shiva shrine in the world. Surrounded by majestic snow peaks, sacred dhuni fires warm the Aghori sadhus holding their trishuls, alongside devout pilgrims offering flowers before the authentic Shiva Lingam.\n\nFrom these Himalayan heights to the Velliangiri foothills of Coimbatore and Kapaleeshwarar — here is a peaceful sanctuary under Mahadeva’s eternal crescent moon. Offer Bilva leaves, perform Ganga Jal abhishekam, light the deepam, and seek His eternal blessings.`}
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

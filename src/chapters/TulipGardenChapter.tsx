import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { TulipGarden } from '../components/TulipGarden';

interface TulipGardenChapterProps {
  onProceed: () => void;
}

export const TulipGardenChapter: React.FC<TulipGardenChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-tulip-garden"
      chapterNumber={23}
      eyebrow="CHAPTER 23 • OUR NETHERLANDS PROMISE"
      title="The Tulip Fields of Keukenhof"
      subtitle={`Endless rows of vibrant blooming tulips under the warm spring sky of Keukenhof • The dream trip you love most and want to experience with me, walking hand in hand through the flower fields of Holland.`}
      primaryAction={{
        label: 'Wind the celestial music box ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <TulipGarden />
    </ChapterLayout>
  );
};

export default TulipGardenChapter;

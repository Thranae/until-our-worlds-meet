import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { Constellation } from '../components/Constellation';
import { siteContent } from '../data/siteContent';

interface FutureTogetherProps {
  onProceed: () => void;
}

export const FutureTogether: React.FC<FutureTogetherProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-future-together"
      chapterNumber={14}
      eyebrow="CHAPTER 14 • THE HORIZON"
      title={siteContent.constellation.heading}
      subtitle={siteContent.constellation.subheading}
      primaryAction={{
        label: 'Release our lantern ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="780px"
    >
      <Constellation />
    </ChapterLayout>
  );
};

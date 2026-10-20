import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { CosmicRadio } from '../components/CosmicRadio';

interface MidnightRadioProps {
  onProceed: () => void;
}

export const MidnightRadio: React.FC<MidnightRadioProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-midnight-radio"
      chapterNumber={4}
      eyebrow="CHAPTER 04 • THE MIDNIGHT FREQUENCIES"
      title="Signals travelling through the dark"
      subtitle={`Late at night, when the rest of the world is quiet, it's our thoughts and conversations traveling across the miles.\n\nSlide the tuning dial to explore our shared late-night frequencies — from soothing rain to your special birthday channel.`}
      primaryAction={{
        label: 'A voice for you',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <CosmicRadio />
    </ChapterLayout>
  );
};

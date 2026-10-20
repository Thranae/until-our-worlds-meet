import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { MemoryGallery } from '../components/MemoryGallery';
import { CelestialRedBull } from '../components/CelestialRedBull';

interface OurConnectionProps {
  onProceed: () => void;
}

export const OurConnection: React.FC<OurConnectionProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-our-connection"
      chapterNumber={3}
      eyebrow="CHAPTER 03 • THE ARTIFACTS"
      title="Things that mean more than they look"
      subtitle={`Not every meaningful thing has to be a big moment. Sometimes, it's a conversation, a voice note, a silly little thing that makes you smile, or just hearing from the person you wanted to hear from.\n\nThese are the little things I want to keep close.`}
      primaryAction={{
        label: 'A little closer',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="860px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
        <MemoryGallery />
        <CelestialRedBull />
      </div>
    </ChapterLayout>
  );
};


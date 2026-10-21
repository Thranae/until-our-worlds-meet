import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { MemoryGallery } from '../components/MemoryGallery';

interface OurConnectionProps {
  onProceed: () => void;
}

export const OurConnection: React.FC<OurConnectionProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-our-connection"
      chapterNumber={11}
      eyebrow="CHAPTER 11 • LIVING MEMORIES ARCHIVE"
      title="Things that mean more than they look"
      subtitle={`Not every meaningful thing has to be a big moment. Sometimes, it's a conversation, a video clip, a candid laugh, or just hearing from the person you wanted to hear from.\n\nThese are the little pieces of your world I want to keep close.`}
      primaryAction={{
        label: 'The 03:47 AM call next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="860px"
    >
      <MemoryGallery />
    </ChapterLayout>
  );
};

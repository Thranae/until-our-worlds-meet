import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { VoicePlayer } from '../components/VoicePlayer';

interface VoiceMessageProps {
  onProceed: () => void;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-voice-message"
      chapterNumber={24}
      eyebrow="CHAPTER 24 • RESONANCE"
      title="This time, hear it from me"
      subtitle="You've read my words, and you've heard my voice. But for your birthday, I wanted to leave you something you could come back to whenever you feel like hearing me."
      primaryAction={{
        label: 'The Nov 8 Time Capsule next ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="680px"
    >
      <VoicePlayer />
    </ChapterLayout>
  );
};

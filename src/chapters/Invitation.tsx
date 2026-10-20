import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { CelestialOrb } from '../components/CelestialOrb';
import { siteContent } from '../data/siteContent';

interface InvitationProps {
  onProceed: () => void;
}

export const Invitation: React.FC<InvitationProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-invitation"
      chapterNumber={1}
      eyebrow={siteContent.recipient.callsign}
      title={siteContent.siteMeta.title}
      subtitle={`Hey, ${siteContent.recipient.nickname}. Birthday girl, this one's for you.\n\nI've been making a little piece of my world for you — something you can open whenever you want a reminder of how much you mean to me.`}
      primaryAction={{
        label: 'Receive your message',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
    >
      {/* 3D Interactive Celestial Particle Orb */}
      <CelestialOrb />
    </ChapterLayout>
  );
};

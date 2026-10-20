import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
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
      {/* Visual: Softly glowing focal point of light */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2rem 0 1rem',
          position: 'relative',
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(216, 204, 255, 0.1) 40%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 24px #A78BFA, 0 0 45px #C084FC',
            }}
          />
        </motion.div>

        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--color-muted)',
            letterSpacing: '0.04em',
            marginTop: '1rem',
          }}
        >
          ✦ November 8
        </span>
      </div>
    </ChapterLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Starfield } from './components/Starfield';
import { AmbientSoundscape } from './components/AmbientSoundscape';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Invitation } from './chapters/Invitation';
import { TwoWorlds } from './chapters/TwoWorlds';
import { OurConnection } from './chapters/OurConnection';
import { VoiceMessage } from './chapters/VoiceMessage';
import { FutureTogether } from './chapters/FutureTogether';
import { BirthdayLetter } from './chapters/BirthdayLetter';
import { siteContent } from './data/siteContent';

export const App: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState(0);

  const chapterNames = [
    'Invitation',
    'Two Worlds',
    'The Little Things',
    'Voice Message',
    'Someday',
    'Birthday Letter',
  ];

  // Scroll to top whenever chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter]);

  // Keyboard navigation for accessible traversal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input/range elements
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentChapter((prev) => Math.min(prev + 1, chapterNames.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentChapter((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterNames.length]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100svh',
        overflowX: 'hidden',
      }}
    >
      {/* Cinematic Starfield Canvas Background */}
      <Starfield />

      {/* Discreet Minimalist Top Bar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'max(3.2rem, calc(env(safe-area-inset-top) + 2rem))',
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          background: 'linear-gradient(180deg, rgba(8, 11, 24, 0.75) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
          <span style={{ color: 'var(--color-lavender)', fontSize: '0.85rem' }}>✦</span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: 'var(--color-ivory)',
              letterSpacing: '0.04em',
            }}
          >
            {siteContent.siteMeta.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', pointerEvents: 'auto' }}>
          <AmbientSoundscape />
          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em',
            }}
          >
            {siteContent.recipient.birthdayDate}
          </div>
        </div>
      </header>

      {/* Main Chapter Content with Transitions */}
      <main style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <AnimatePresence mode="wait">
          {currentChapter === 0 && (
            <Invitation key="ch-0" onProceed={() => setCurrentChapter(1)} />
          )}

          {currentChapter === 1 && (
            <TwoWorlds key="ch-1" onProceed={() => setCurrentChapter(2)} />
          )}

          {currentChapter === 2 && (
            <OurConnection key="ch-2" onProceed={() => setCurrentChapter(3)} />
          )}

          {currentChapter === 3 && (
            <VoiceMessage key="ch-3" onProceed={() => setCurrentChapter(4)} />
          )}

          {currentChapter === 4 && (
            <FutureTogether key="ch-4" onProceed={() => setCurrentChapter(5)} />
          )}

          {currentChapter === 5 && (
            <BirthdayLetter
              key="ch-5"
              onReturnToVoice={() => setCurrentChapter(3)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation Dots */}
      <ProgressIndicator
        currentChapter={currentChapter}
        totalChapters={chapterNames.length}
        chapterNames={chapterNames}
        onSelectChapter={(index) => setCurrentChapter(index)}
      />
    </div>
  );
};

export default App;

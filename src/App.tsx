import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Starfield } from './components/Starfield';
import { BackgroundMusic } from './components/BackgroundMusic';
import { ProgressIndicator } from './components/ProgressIndicator';
import { SkyLanternModal } from './components/SkyLanternModal';
import { Invitation } from './chapters/Invitation';
import { TwoWorlds } from './chapters/TwoWorlds';
import { AstrolabeChapter } from './chapters/AstrolabeChapter';
import { WeatherChapter } from './chapters/WeatherChapter';
import { DropZoneChapter } from './chapters/DropZoneChapter';
import { SafeZoneChapter } from './chapters/SafeZoneChapter';
import { SniperScopeChapter } from './chapters/SniperScopeChapter';
import { AirDropChapter } from './chapters/AirDropChapter';
import { HeartbeatChapter } from './chapters/HeartbeatChapter';
import { RedBullChapter } from './chapters/RedBullChapter';
import { OurConnection } from './chapters/OurConnection';
import { MidnightCallChapter } from './chapters/MidnightCallChapter';
import { MidnightRadio } from './chapters/MidnightRadio';
import { MistyWindowChapter } from './chapters/MistyWindowChapter';
import { GalaxyProjectorChapter } from './chapters/GalaxyProjectorChapter';
import { AuroraChapter } from './chapters/AuroraChapter';
import { MidnightDriveChapter } from './chapters/MidnightDriveChapter';
import { MarinaBeachChapter } from './chapters/MarinaBeachChapter';
import { ShivaChapter } from './chapters/ShivaChapter';
import { AirportTerminalChapter } from './chapters/AirportTerminalChapter';
import { CoffeeChapter } from './chapters/CoffeeChapter';
import { TravelJournalChapter } from './chapters/TravelJournalChapter';
import { MusicBoxChapter } from './chapters/MusicBoxChapter';
import { VoiceMessage } from './chapters/VoiceMessage';
import { TimeCapsuleChapter } from './chapters/TimeCapsuleChapter';
import { FutureTogether } from './chapters/FutureTogether';
import { LanternSky } from './chapters/LanternSky';
import { BirthdayLetter } from './chapters/BirthdayLetter';
import { siteContent } from './data/siteContent';

export const App: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isLanternModalOpen, setIsLanternModalOpen] = useState(false);

  const chapterNames = [
    'Invitation',
    'Two Worlds',
    'The Dual Horizon',
    'Shared Skies',
    'The Drop Zone',
    'The Safe Zone',
    'The 8x Optical Lock',
    'The Care Package',
    'The Pulse Across Miles',
    'Her Starlight Red Bull',
    'Living Memories',
    'The 03:47 AM Call',
    'Midnight Radio',
    'Misty Window',
    'Our Starlit Ceiling',
    'The Aurora Veil',
    'The Midnight Drive',
    'The Ocean & Blue Whale',
    'Sacred Kailash • Mahadeva',
    'Terminal Arrival',
    'Two Cups of Coffee',
    'Himalayan Shivan Temple',
    'Music Box',
    'Voice Message',
    'Nov 8 Time Capsule',
    'Someday',
    'Sea of Lanterns',
    'Birthday Letter',
  ];

  // Scroll to top instantly and reliably whenever chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(rafId);
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

  // Touch swipe navigation for mobile
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect predominantly horizontal swipe (distance >= 55px)
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped left -> advance to next chapter
        setCurrentChapter((prev) => Math.min(prev + 1, chapterNames.length - 1));
      } else {
        // Swiped right -> return to previous chapter
        setCurrentChapter((prev) => Math.max(prev - 1, 0));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100svh',
        overflowX: 'hidden',
      }}
    >
      {/* Cinematic Starfield Canvas Background */}
      <Starfield />

      {/* Discreet Minimalist Top Bar with Frosted Glass */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'max(3.3rem, calc(env(safe-area-inset-top) + 2.2rem))',
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'max(0.85rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.85rem, env(safe-area-inset-right))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          backgroundColor: 'rgba(8, 11, 24, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            pointerEvents: 'auto',
            minWidth: 0,
            flexShrink: 1,
            marginRight: '0.5rem',
          }}
        >
          <span style={{ color: 'var(--color-lavender)', fontSize: '0.82rem', flexShrink: 0 }}>✦</span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--color-ivory)',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {siteContent.siteMeta.title}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            pointerEvents: 'auto',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate(12);
                } catch {
                  // Safe fallback
                }
              }
              window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
            }}
            title="Send a shooting star wish across the universe"
            aria-label="Send a shooting star wish"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(253, 230, 138, 0.1)',
              border: '1px solid rgba(253, 230, 138, 0.3)',
              color: 'var(--color-gold-soft)',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <span>✦ Wish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate(12);
                } catch {
                  // Safe fallback
                }
              }
              setCurrentChapter(26); // Jump straight to Chapter 27: Sea of Lanterns
            }}
            title="Release a midnight sky lantern for Bot"
            aria-label="Release a sky lantern"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: currentChapter === 26 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              color: '#FDE68A',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <Flame size={12} color="#F59E0B" fill="#F59E0B" />
            <span>Lanterns</span>
          </button>

          <BackgroundMusic src="/sounds/zaalima.mp3" targetVolume={0.05} />
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
            <AstrolabeChapter key="ch-2" onProceed={() => setCurrentChapter(3)} />
          )}

          {currentChapter === 3 && (
            <WeatherChapter key="ch-3" onProceed={() => setCurrentChapter(4)} />
          )}

          {currentChapter === 4 && (
            <DropZoneChapter key="ch-4" onProceed={() => setCurrentChapter(5)} />
          )}

          {currentChapter === 5 && (
            <SafeZoneChapter key="ch-5" onProceed={() => setCurrentChapter(6)} />
          )}

          {currentChapter === 6 && (
            <SniperScopeChapter key="ch-6" onProceed={() => setCurrentChapter(7)} />
          )}

          {currentChapter === 7 && (
            <AirDropChapter key="ch-7" onProceed={() => setCurrentChapter(8)} />
          )}

          {currentChapter === 8 && (
            <HeartbeatChapter key="ch-8" onProceed={() => setCurrentChapter(9)} />
          )}

          {currentChapter === 9 && (
            <RedBullChapter key="ch-9" onProceed={() => setCurrentChapter(10)} />
          )}

          {currentChapter === 10 && (
            <OurConnection key="ch-10" onProceed={() => setCurrentChapter(11)} />
          )}

          {currentChapter === 11 && (
            <MidnightCallChapter key="ch-11" onProceed={() => setCurrentChapter(12)} />
          )}

          {currentChapter === 12 && (
            <MidnightRadio key="ch-12" onProceed={() => setCurrentChapter(13)} />
          )}

          {currentChapter === 13 && (
            <MistyWindowChapter key="ch-13" onProceed={() => setCurrentChapter(14)} />
          )}

          {currentChapter === 14 && (
            <GalaxyProjectorChapter key="ch-14" onProceed={() => setCurrentChapter(15)} />
          )}

          {currentChapter === 15 && (
            <AuroraChapter key="ch-15" onProceed={() => setCurrentChapter(16)} />
          )}

          {currentChapter === 16 && (
            <MidnightDriveChapter key="ch-16" onProceed={() => setCurrentChapter(17)} />
          )}

          {currentChapter === 17 && (
            <MarinaBeachChapter key="ch-17" onProceed={() => setCurrentChapter(18)} />
          )}

          {currentChapter === 18 && (
            <ShivaChapter key="ch-18" onProceed={() => setCurrentChapter(19)} />
          )}

          {currentChapter === 19 && (
            <AirportTerminalChapter key="ch-19" onProceed={() => setCurrentChapter(20)} />
          )}

          {currentChapter === 20 && (
            <CoffeeChapter key="ch-20" onProceed={() => setCurrentChapter(21)} />
          )}

          {currentChapter === 21 && (
            <TravelJournalChapter key="ch-21" onProceed={() => setCurrentChapter(22)} />
          )}

          {currentChapter === 22 && (
            <MusicBoxChapter key="ch-22" onProceed={() => setCurrentChapter(23)} />
          )}

          {currentChapter === 23 && (
            <VoiceMessage key="ch-23" onProceed={() => setCurrentChapter(24)} />
          )}

          {currentChapter === 24 && (
            <TimeCapsuleChapter key="ch-24" onProceed={() => setCurrentChapter(25)} />
          )}

          {currentChapter === 25 && (
            <FutureTogether key="ch-25" onProceed={() => setCurrentChapter(26)} />
          )}

          {currentChapter === 26 && (
            <LanternSky key="ch-26" onProceedToLetter={() => setCurrentChapter(27)} />
          )}

          {currentChapter === 27 && (
            <BirthdayLetter
              key="ch-27"
              onReturnToVoice={() => setCurrentChapter(23)}
              onOpenLantern={() => setCurrentChapter(26)}
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

      {/* Interactive Sky Lantern Modal */}
      <SkyLanternModal
        isOpen={isLanternModalOpen}
        onClose={() => setIsLanternModalOpen(false)}
      />
    </div>
  );
};

export default App;

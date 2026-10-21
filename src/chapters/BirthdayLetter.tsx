import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, BookOpen, Phone, Sparkles, MailOpen, Flame } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface BirthdayLetterProps {
  onReturnToVoice: () => void;
  onOpenLantern?: () => void;
}

export const BirthdayLetter: React.FC<BirthdayLetterProps> = ({ onReturnToVoice, onOpenLantern }) => {
  const [isUnsealed, setIsUnsealed] = useState(false);
  const letterRef = useRef<HTMLDivElement | null>(null);

  const playCelebrationChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 starry harp chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.6);
      });
    } catch {
      // Safe fallback if audio context blocked
    }
  };

  const handleUnseal = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 50, 40, 60, 30]);
      } catch {
        // Safe fallback
      }
    }
    playCelebrationChime();

    // Trigger celestial shooting star celebration across the sky
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
      }, 400);
    }

    setIsUnsealed(true);
  };

  const handleReadAgain = () => {
    handleUnseal();
    if (letterRef.current) {
      letterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const letter = siteContent.letter;
  const contact = siteContent.contact;

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <motion.section
      id="chapter-birthday-letter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 'max(5.8rem, calc(env(safe-area-inset-top) + 4.2rem))',
        paddingBottom: 'max(7rem, calc(env(safe-area-inset-bottom) + 5rem))',
        paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        ref={letterRef}
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="eyebrow"
          style={{
            color: 'var(--color-lavender)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Sparkles size={13} />
          <span>CHAPTER 29 • FOR {siteContent.recipient.nickname.toUpperCase()}, WITH LOVE</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="heading-chapter"
          style={{
            textAlign: 'center',
            color: 'var(--color-ivory)',
            marginBottom: '2rem',
          }}
        >
          Happy birthday, my favourite person
        </motion.h2>

        {/* INTERACTIVE WAX SEAL ENVELOPE (Unsealing experience) */}
        {!isUnsealed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(253, 230, 138, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(167, 139, 250, 0.15)',
              position: 'relative',
            }}
            onClick={handleUnseal}
          >
            {/* Ambient Gold Glow */}
            <div
              style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(253, 230, 138, 0.25) 0%, transparent 70%)',
                filter: 'blur(25px)',
                pointerEvents: 'none',
              }}
            />

            {/* Embossed Wax Seal Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #F59E0B 0%, #D97706 60%, #78350F 100%)',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.45), inset -3px -3px 8px rgba(0, 0, 0, 0.5), inset 3px 3px 8px rgba(255, 255, 255, 0.4)',
                border: '2px solid rgba(254, 240, 138, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#FEF3C7',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                }}
              >
                ✦
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  color: '#FEF3C7',
                  letterSpacing: '0.08em',
                  marginTop: '2px',
                }}
              >
                BOT
              </span>
            </motion.div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                color: 'var(--color-ivory)',
                marginBottom: '0.5rem',
              }}
            >
              A Letter from Coimbatore to Chennai
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-muted)',
                marginBottom: '1.5rem',
                maxWidth: '360px',
              }}
            >
              Written especially for your birthday on November 8, celebrating your graduation and our story. Tap to break the celestial seal and open.
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleUnseal();
              }}
              style={{
                fontSize: '0.9rem',
                padding: '0.65rem 1.6rem',
              }}
            >
              <MailOpen size={16} />
              <span>Open Birthday Letter</span>
            </button>
          </motion.div>
        ) : (
          /* UNFOLDED CINEMATIC LETTER */
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel"
            style={{
              width: '100%',
              padding: 'clamp(2rem, 5vw, 3.5rem)',
              background: 'linear-gradient(180deg, rgba(17, 21, 44, 0.85) 0%, rgba(10, 13, 28, 0.92) 100%)',
              border: '1px solid rgba(216, 204, 255, 0.18)',
              boxShadow: '0 24px 65px rgba(0, 0, 0, 0.6), 0 0 45px rgba(167, 139, 250, 0.12)',
              position: 'relative',
            }}
          >
            {/* Candlelight Warmth Backdrop */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '320px',
                height: '140px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(253, 230, 138, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Emblem Watermark */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2.2rem',
                opacity: 0.7,
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--color-lavender), transparent)',
                }}
              />
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.18em',
                  color: 'var(--color-gold-soft)',
                  margin: '0 0.9rem',
                }}
              >
                ✦ 11.08 ✦
              </span>
              <div
                style={{
                  width: '42px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--color-lavender), transparent)',
                }}
              />
            </div>

            {/* Letter Body */}
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.15rem, 2.5vw, 1.38rem)',
                lineHeight: 1.85,
                color: 'var(--color-ivory)',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: '1.6rem', color: '#FFFFFF' }}>
                {letter.salutation}
              </p>

              {letter.paragraphs.slice(0, 2).map((paragraph, idx) => (
                <p
                  key={idx}
                  style={{
                    marginBottom: '1.6rem',
                    color: 'rgba(245, 240, 232, 0.92)',
                  }}
                >
                  {paragraph}
                </p>
              ))}

              {/* Tucked Polaroid Keepsake */}
              <motion.div
                initial={{ opacity: 0, rotate: -4, scale: 0.95 }}
                animate={{ opacity: 1, rotate: -1.5, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                whileHover={{ rotate: 0, scale: 1.03 }}
                style={{
                  maxWidth: '250px',
                  margin: '2rem auto 2.5rem',
                  padding: '0.85rem 0.85rem 1.6rem 0.85rem',
                  background: '#FFFDF9',
                  borderRadius: '4px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Golden Paperclip Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '26px',
                    width: '14px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '2.5px solid #D97706',
                    borderBottom: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 2,
                  }}
                />

                <div
                  style={{
                    width: '100%',
                    height: '240px',
                    overflow: 'hidden',
                    borderRadius: '2px',
                    background: '#0B0D1A',
                  }}
                >
                  <img
                    src="/memories/1792580021104.jpg"
                    alt="Her Starlight Portrait"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.04) brightness(0.96)',
                    }}
                  />
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.88rem',
                    fontStyle: 'italic',
                    color: '#292524',
                    marginTop: '0.85rem',
                    marginBottom: 0,
                    letterSpacing: '0.02em',
                  }}
                >
                  "The starlight of November 8 ✦"
                </p>
              </motion.div>

              {letter.paragraphs.slice(2).map((paragraph, idx) => (
                <p
                  key={idx + 2}
                  style={{
                    marginBottom: '1.6rem',
                    color: 'rgba(245, 240, 232, 0.92)',
                  }}
                >
                  {paragraph}
                </p>
              ))}

              <p
                style={{
                  fontWeight: 600,
                  marginTop: '2.2rem',
                  color: '#FFFFFF',
                }}
              >
                {letter.closing}
              </p>
            </div>
          </motion.div>
        )}

        {/* Interactive Post-Letter Actions */}
        {isUnsealed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '3rem',
            }}
          >
            {/* Primary Action: Listen to Voice Again */}
            <button
              type="button"
              className="btn-primary"
              onClick={onReturnToVoice}
              aria-label="Listen to my voice again"
            >
              <Volume2 size={18} />
              <span>Listen to my voice again</span>
            </button>

            {/* Secondary Action: Read Letter Again */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReadAgain}
              aria-label="Read my letter again"
            >
              <BookOpen size={16} />
              <span>Read my letter again</span>
            </button>

            {/* Send a Wish Across the Sky Action */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                playCelebrationChime();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
                }
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try {
                    navigator.vibrate(20);
                  } catch {
                    // fallback
                  }
                }
              }}
              style={{
                borderColor: 'rgba(253, 230, 138, 0.45)',
                color: 'var(--color-gold-soft)',
              }}
              aria-label="Send a birthday wish across the sky"
            >
              <Sparkles size={15} color="#FDE68A" />
              <span>Send a wish to the sky</span>
            </button>

            {/* Release a Midnight Sky Lantern Action */}
            {onOpenLantern && (
              <button
                type="button"
                className="btn-primary"
                onClick={onOpenLantern}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(254, 240, 138, 0.6)',
                  color: '#FEF3C7',
                }}
                aria-label="Release a midnight sky lantern for Bot"
              >
                <Flame size={16} />
                <span>Release a Sky Lantern ✦</span>
              </button>
            )}

            {/* Optional Call Option if enabled in config */}
            {contact.enableCallOption && contact.callUrl && (
              <a
                href={contact.callUrl}
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  borderColor: 'rgba(167, 139, 250, 0.35)',
                  color: 'var(--color-lilac)',
                }}
                aria-label={contact.callButtonText}
              >
                <Phone size={15} />
                <span>{contact.callButtonText}</span>
              </a>
            )}
          </motion.div>
        )}

        {/* Concluding Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            letterSpacing: '0.08em',
          }}
        >
          <span style={{ color: 'var(--color-lavender)', marginRight: '0.35rem' }}>✦</span>
          Until our worlds meet ✦
        </motion.div>
      </div>
    </motion.section>
  );
};

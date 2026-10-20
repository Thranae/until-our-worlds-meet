import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, MessageSquare, Smile, Feather, ChevronDown } from 'lucide-react';
import { siteContent, MemoryItem } from '../data/siteContent';

export const MemoryGallery: React.FC = () => {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

  const getIcon = (type: MemoryItem['type'], color: string) => {
    switch (type) {
      case 'photo':
        return <Image size={20} color={color} />;
      case 'message':
        return <MessageSquare size={20} color={color} />;
      case 'joke':
        return <Smile size={20} color={color} />;
      case 'note':
      default:
        return <Feather size={20} color={color} />;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        margin: '1rem 0',
      }}
    >
      {siteContent.memories.map((item) => {
        const isExpanded = selectedMemory === item.id;

        return (
          <motion.div
            key={item.id}
            layout
            onClick={() => setSelectedMemory(isExpanded ? null : item.id)}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              border: isExpanded
                ? `1px solid ${item.accent}`
                : '1px solid var(--color-border)',
              boxShadow: isExpanded
                ? `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${item.accent}25`
                : '0 8px 24px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top Bar with Icon & Tag */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: `${item.accent}15`,
                    border: `1px solid ${item.accent}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(item.type, item.accent)}
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-sans)',
                    color: item.accent,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {item.type}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: 'var(--color-ivory)',
                  marginBottom: '0.25rem',
                }}
              >
                {item.title}
              </h4>

              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                  marginBottom: '0.9rem',
                }}
              >
                {item.subtitle}
              </p>

              {/* Optional Custom Image if supplied */}
              {item.imagePath && (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={item.imagePath}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Snippet */}
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--color-ivory-dim)',
                  fontStyle: 'italic',
                }}
              >
                "{item.snippet}"
              </p>
            </div>

            {/* Revealed Note Area */}
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  color: item.accent,
                  fontWeight: 500,
                }}
              >
                <span>{isExpanded ? 'Hide note' : 'Tap to read note'}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(8, 11, 24, 0.65)',
                        border: '1px solid rgba(216, 204, 255, 0.1)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.86rem',
                          lineHeight: 1.6,
                          color: 'var(--color-ivory)',
                        }}
                      >
                        {item.revealedNote}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

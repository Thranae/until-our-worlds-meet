import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { PlanetPair } from '../components/PlanetPair';
import { CelestialSkyClock } from '../components/CelestialSkyClock';

interface TwoWorldsProps {
  onProceed: () => void;
}

export const TwoWorlds: React.FC<TwoWorldsProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-two-worlds"
      chapterNumber={2}
      eyebrow="CHAPTER 02 • THE DISTANCE"
      title="Different places, same little universe"
      subtitle={`We're in different cities, under different skies. And somehow, you've become such a special part of my everyday life.\n\nIt's strange and beautiful how someone can feel close even when they're far away.`}
      primaryAction={{
        label: 'Where we first dropped ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <PlanetPair />
        <CelestialSkyClock />
      </div>
    </ChapterLayout>
  );
};

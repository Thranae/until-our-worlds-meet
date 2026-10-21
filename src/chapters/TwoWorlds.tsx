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
      eyebrow="CHAPTER 02 • CHENNAI TO COIMBATORE"
      title="From Kovai's Hills to the Marina Coast"
      subtitle={`Coimbatore and Chennai • ~500 km across Tamil Nadu, under the exact same starlit sky.\n\nYou've finished your studies and stepped into this exciting new chapter of your life, and across every mile of this state, I am endlessly proud of you.`}
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

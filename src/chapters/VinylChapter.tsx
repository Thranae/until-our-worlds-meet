import React from 'react';
import { GalaxyProjectorChapter } from './GalaxyProjectorChapter';

interface VinylChapterProps {
  onProceed: () => void;
}

export const VinylChapter: React.FC<VinylChapterProps> = ({ onProceed }) => {
  return <GalaxyProjectorChapter onProceed={onProceed} />;
};

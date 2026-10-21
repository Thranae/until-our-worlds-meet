import React from 'react';
import { CoffeeChapter } from './CoffeeChapter';

interface ChaiChapterProps {
  onProceed: () => void;
}

export const ChaiChapter: React.FC<ChaiChapterProps> = ({ onProceed }) => {
  return <CoffeeChapter onProceed={onProceed} />;
};

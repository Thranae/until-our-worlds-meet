import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChapterLayout } from '../components/ChapterLayout';
import { SharedWeather } from '../components/SharedWeather';

interface WeatherChapterProps {
  onProceed: () => void;
}

export const WeatherChapter: React.FC<WeatherChapterProps> = ({ onProceed }) => {
  return (
    <ChapterLayout
      id="chapter-weather"
      chapterNumber={4}
      eyebrow="CHAPTER 04 • THE SHARED SKIES"
      title="Different cities, one single sky"
      subtitle="Whether it rains outside your window or the stars shine in mine, the atmosphere between us is always connected."
      primaryAction={{
        label: 'The battle zone where we met ✦',
        onClick: onProceed,
        icon: <ArrowRight size={17} />,
      }}
      maxWidth="760px"
    >
      <SharedWeather />
    </ChapterLayout>
  );
};

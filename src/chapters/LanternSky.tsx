import React from 'react';
import { SkyLanternFlight } from '../components/SkyLanternFlight';

interface LanternSkyProps {
  onProceedToLetter: () => void;
}

export const LanternSky: React.FC<LanternSkyProps> = ({ onProceedToLetter }) => {
  return <SkyLanternFlight onProceedToLetter={onProceedToLetter} />;
};

import React from 'react';
import { HalftoneGlobe } from './HalftoneGlobe';

export interface DotMatrixGlobeProps {
  className?: string;
  theme?: 'light' | 'dark';
  scrollProgress?: number;
  rotationSpeed?: number;
}

export const DotMatrixGlobe: React.FC<DotMatrixGlobeProps> = ({
  className = '',
  scrollProgress = 0,
}) => {
  return <HalftoneGlobe className={className} scrollProgress={scrollProgress} />;
};

export default DotMatrixGlobe;

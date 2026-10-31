import React from 'react';
import { AtomicGlobe } from '../3d/AtomicGlobe';
import { cn } from '../../lib/utils';

export interface GlobeProps {
  size?: number | string;
  crop?: 'bottom-rise' | 'side-peek' | 'corner' | 'full-small';
  rotationSpeed?: number;
  className?: string;
  interactive?: boolean;
  dotSize?: number;
  dotTarget?: number;
}

export const Globe: React.FC<GlobeProps> = ({
  size = '100%',
  crop = 'corner',
  rotationSpeed = 0.045,
  className = '',
  interactive = false,
  dotSize,
  dotTarget,
}) => {
  const isMini = crop !== 'bottom-rise';
  const widthVal = typeof size === 'number' ? `${size}px` : size;
  const heightVal = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{ width: widthVal, height: heightVal }}
      className={cn('relative overflow-hidden select-none', className)}
      aria-label="Horizon Atomic Stipple Earth Globe"
    >
      <AtomicGlobe
        isMini={isMini}
        spin={rotationSpeed}
        dotSize={dotSize ?? (isMini ? 3.0 : 5.2)}
        dotTarget={dotTarget ?? (isMini ? 26000 : 240000)}
        interactive={interactive}
        zoom={crop === 'corner' ? 1.05 : 1.0}
        className="w-full h-full"
      />
    </div>
  );
};

export default Globe;

import React from 'react';
import { HardwareAnimationType } from '../../types/quiz';
import { HardwareAnimation3D } from './HardwareAnimation3D';

interface HardwareAnimationProps {
  type: HardwareAnimationType;
  customAssetUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  interactive?: boolean;
  autoRotate?: boolean;
}

export const HardwareAnimation: React.FC<HardwareAnimationProps> = (props) => {
  return <HardwareAnimation3D {...props} />;
};

export { HardwareAnimation3D };

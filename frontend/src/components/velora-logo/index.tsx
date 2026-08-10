import React from 'react';

interface VeloraLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const VeloraLogo: React.FC<VeloraLogoProps> = ({ 
  width = 120, 
  height = 40, 
  className 
}) => {
  return (
    <img
      src="/logo-w715.webp"
      alt="Velora Logo"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default VeloraLogo;
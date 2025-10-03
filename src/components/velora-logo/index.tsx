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
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="veloraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      
      {/* Modern geometric logo shape */}
      <path
        d="M8 8 L20 8 L26 20 L20 32 L8 32 L14 20 Z"
        fill="url(#veloraGradient)"
      />
      <path
        d="M20 8 L32 8 L26 20 L32 32 L20 32 L26 20 Z"
        fill="url(#veloraGradient)"
        fillOpacity="0.8"
      />
      
      {/* Velora text */}
      <text
        x="42"
        y="26"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="url(#veloraGradient)"
      >
        Velora
      </text>
    </svg>
  );
};

export default VeloraLogo;
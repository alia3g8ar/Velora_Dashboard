import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <img
      src="/logo-w715.webp"
      alt={t("brand.logoAlt")}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default VeloraLogo;

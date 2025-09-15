import React from 'react';

// Imports dos ícones das marcas
import c6Icon from '@/assets/icons/c6/icon-180.png';
import interIcon from '@/assets/icons/inter/icon-180.png';
import itauIcon from '@/assets/icons/itau/icon-180.png';
import nubankIcon from '@/assets/icons/nubank/icon-180.png';
import santanderIcon from '@/assets/icons/santander/icon-180.png';
import utmifyIcon from '@/assets/icons/utmify/icon-180.png';

interface BrandIconProps {
  brandSlug: string;
  className?: string;
  alt?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// Objeto com os ícones importados
const brandIcons: Record<string, string> = {
  c6: c6Icon,
  inter: interIcon,
  itau: itauIcon,
  nubank: nubankIcon,
  santander: santanderIcon,
  utmify: utmifyIcon,
};

// Função para obter a URL do ícone da marca (para apple-touch-icon)
export const getBrandIconUrl = (brandSlug: string): string => {
  return brandIcons[brandSlug] || '';
};

export const BrandIcon: React.FC<BrandIconProps> = ({ 
  brandSlug, 
  className = "w-8 h-8 object-contain",
  alt,
  onError 
}) => {
  const iconSrc = brandIcons[brandSlug];
  
  if (!iconSrc) {
    console.warn(`Brand icon not found for slug: ${brandSlug}`);
    return null;
  }

  return (
    <img 
      src={iconSrc}
      alt={alt || `${brandSlug} ícone`}
      className={className}
      onError={onError}
    />
  );
};

export default BrandIcon;

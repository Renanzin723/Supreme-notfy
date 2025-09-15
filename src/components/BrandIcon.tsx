import React from 'react';

interface BrandIconProps {
  brandSlug: string;
  className?: string;
  alt?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// URLs dos ícones usando caminhos públicos
const brandIcons: Record<string, string> = {
  c6: '/icons/c6/icon-180.png',
  inter: '/icons/inter/icon-180.png',
  itau: '/icons/itau/icon-180.png',
  nubank: '/icons/nubank/icon-180.png',
  santander: '/icons/santander/icon-180.png',
  utmify: '/icons/utmify/icon-180.png',
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

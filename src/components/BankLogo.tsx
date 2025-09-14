import React from 'react';

interface BankLogoProps {
  bank: string;
  size?: number;
  className?: string;
}

const BankLogo: React.FC<BankLogoProps> = ({ bank, size = 64, className = '' }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const logoStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  // Usar URLs relativas simples
  const logoUrls = {
    nubank: '/images/banks/nubank.png',
    santander: '/images/banks/Santander.png',
    itau: '/images/banks/itau.png',
    inter: '/images/banks/inter.png',
    c6: '/images/banks/c6-bank.png',
    utmify: '/images/banks/Utmify.png'
  };

  const logoUrl = logoUrls[bank as keyof typeof logoUrls];

  // Se houve erro ao carregar a imagem, mostrar fallback
  if (imageError) {
    return (
      <div 
        style={logoStyle}
        className={`bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center ${className}`}
      >
        <span className="text-white font-bold text-lg">{bank.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  if (logoUrl) {
    return (
      <img 
        src={logoUrl}
        alt={`${bank} logo`}
        style={logoStyle}
        className={`rounded-lg ${className}`}
        onError={() => {
          console.error(`Failed to load bank logo: ${logoUrl}`);
          setImageError(true);
        }}
        onLoad={() => {
          console.log(`Successfully loaded bank logo: ${logoUrl}`);
          setImageLoaded(true);
        }}
      />
    );
  }

  // Fallback para bancos não encontrados
  return (
    <div 
      style={logoStyle}
      className={`bg-gray-500 rounded-lg flex items-center justify-center ${className}`}
    >
      <span className="text-white font-bold text-sm">?</span>
    </div>
  );
};

export default BankLogo;

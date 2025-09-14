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

  // Usar URLs absolutas com timestamp para evitar cache
  const baseUrl = window.location.origin;
  const logoUrls = {
    nubank: `${baseUrl}/images/banks/nubank.png?v=${Date.now()}`,
    santander: `${baseUrl}/images/banks/Santander.png?v=${Date.now()}`,
    itau: `${baseUrl}/images/banks/itau.png?v=${Date.now()}`,
    inter: `${baseUrl}/images/banks/inter.png?v=${Date.now()}`,
    c6: `${baseUrl}/images/banks/c6-bank.png?v=${Date.now()}`,
    utmify: `${baseUrl}/images/banks/Utmify.png?v=${Date.now()}`
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

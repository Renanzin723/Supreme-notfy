import React from 'react';

// Importar as imagens diretamente para garantir que sejam processadas pelo Vite
import nubankLogo from '@/assets/nubank.png';
import santanderLogo from '@/assets/Santander.png';
import itauLogo from '@/assets/itau.png';
import interLogo from '@/assets/inter.png';
import c6Logo from '@/assets/c6-bank.png';
import utmifyLogo from '@/assets/Utmify.png';

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

  // Imports das imagens processadas pelo Vite
  const logoUrls = {
    nubank: nubankLogo,
    santander: santanderLogo,
    itau: itauLogo,
    inter: interLogo,
    c6: c6Logo,
    utmify: utmifyLogo
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

import React from 'react';

interface BankLogoProps {
  bank: string;
  size?: number;
  className?: string;
}

const BankLogo: React.FC<BankLogoProps> = ({ bank, size = 64, className = '' }) => {
  const logoStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  // Caminhos das imagens PNG que você já tem
  const logoUrls = {
    nubank: '/images/banks/nubank.png',
    santander: '/images/banks/Santander.png',
    itau: '/images/banks/itau.png',
    inter: '/images/banks/inter.png',
    c6: '/images/banks/c6-bank.png',
    utmify: '/images/banks/Utmify.png'
  };

  const logoUrl = logoUrls[bank as keyof typeof logoUrls];

  if (logoUrl) {
    return (
      <img 
        src={logoUrl}
        alt={`${bank} logo`}
        style={logoStyle}
        className={`rounded-lg ${className}`}
        onError={(e) => {
          console.error(`Failed to load bank logo: ${logoUrl}`);
          // Fallback para quando a imagem não carregar
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div style="width: ${size}px; height: ${size}px; background: #8A2BE2; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size * 0.3}px;">${bank.charAt(0).toUpperCase()}</div>`;
          }
        }}
        onLoad={() => {
          console.log(`Successfully loaded bank logo: ${logoUrl}`);
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

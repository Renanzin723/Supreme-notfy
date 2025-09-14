import React from 'react';

// Importar as imagens diretamente
import nubankLogo from '@/assets/nubank.png';
import santanderLogo from '@/assets/Santander.png';
import itauLogo from '@/assets/itau.png';
import interLogo from '@/assets/inter.png';
import c6Logo from '@/assets/c6-bank.png';
import utmifyLogo from '@/assets/Utmify.png';

const ImageTest = () => {
  const testImages = [
    { name: 'nubank', src: nubankLogo },
    { name: 'santander', src: santanderLogo },
    { name: 'itau', src: itauLogo },
    { name: 'inter', src: interLogo },
    { name: 'c6', src: c6Logo },
    { name: 'utmify', src: utmifyLogo }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Imagens</h2>
      <div className="grid grid-cols-2 gap-4">
        {testImages.map((image, index) => (
          <div key={index} className="border p-2">
            <p className="text-sm mb-2">{image.name}</p>
            <img 
              src={image.src} 
              alt={`Test ${image.name}`}
              className="w-16 h-16 object-contain border"
              onLoad={() => console.log(`✅ Loaded: ${image.name}`)}
              onError={(e) => {
                console.error(`❌ Failed: ${image.name}`);
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = '#ff0000';
                target.style.color = '#fff';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
                target.innerHTML = '❌';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;

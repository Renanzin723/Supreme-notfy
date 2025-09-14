import React from 'react';

const ImageTest = () => {
  const testImages = [
    '/images/banks/nubank.png',
    '/images/banks/Santander.png',
    '/images/banks/itau.png',
    '/images/banks/inter.png',
    '/images/banks/c6-bank.png',
    '/images/banks/Utmify.png'
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Imagens</h2>
      <div className="grid grid-cols-2 gap-4">
        {testImages.map((src, index) => (
          <div key={index} className="border p-2">
            <p className="text-sm mb-2">{src}</p>
            <img 
              src={src} 
              alt={`Test ${index}`}
              className="w-16 h-16 object-contain border"
              onLoad={() => console.log(`✅ Loaded: ${src}`)}
              onError={(e) => {
                console.error(`❌ Failed: ${src}`);
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

import { useEffect } from 'react';
import BankLogo from '@/components/BankLogo';

const BrandInter = () => {
  useEffect(() => {
    document.title = 'Banco Inter';
    
    const existingMetas = document.querySelectorAll('[data-brand-meta]');
    existingMetas.forEach(meta => meta.remove());
    const existingLinks = document.querySelectorAll('[data-brand-link]');
    existingLinks.forEach(link => link.remove());

    const metaTags = [
      { name: 'apple-mobile-web-app-title', content: 'Banco Inter' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { name: 'theme-color', content: '#FF8C00' },
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', tag.name);
      meta.setAttribute('content', tag.content);
      meta.setAttribute('data-brand-meta', 'true');
      document.head.appendChild(meta);
    });

    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
    appleTouchIcon.setAttribute('sizes', '180x180');
    appleTouchIcon.setAttribute('href', '/icons/inter/icon-180.png?v=4');
    appleTouchIcon.setAttribute('data-brand-link', 'true');
    document.head.appendChild(appleTouchIcon);

    const manifestLink = document.createElement('link');
    manifestLink.setAttribute('rel', 'manifest');
    manifestLink.setAttribute('href', '/manifests/inter.webmanifest');
    manifestLink.setAttribute('data-brand-link', 'true');
    document.head.appendChild(manifestLink);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center text-white">
        <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center shadow-2xl">
          <BankLogo bank="inter" size={96} />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Banco Inter</h1>
        
        <div id="install-instructions" className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <p className="text-lg mb-4">Para instalar com este ícone:</p>
          <div className="text-left space-y-2">
            <p>1. Toque em <strong>Compartilhar</strong> 📤</p>
            <p>2. Selecione <strong>"Adicionar à Tela de Início"</strong></p>
            <p>3. Toque em <strong>"Adicionar"</strong></p>
          </div>
        </div>
      </div>

      <div 
        id="manual-open" 
        style={{
          position: 'fixed',
          left: '12px',
          right: '12px',
          bottom: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 9999
        }}
      >
        <button 
          onClick={() => window.location.href = '/app'}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '12px',
            border: 'none',
            background: '#4F46E5',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Abrir dashboard agora
        </button>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          var BRAND = { slug: 'inter', name: 'Banco Inter' };
          try {
            localStorage.setItem('brandSlug', BRAND.slug);
            localStorage.setItem('brandName', BRAND.name);
          } catch (e) {}

          var inStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
                             || (window.navigator && window.navigator.standalone === true);

          if (inStandalone) {
            window.location.replace('/app');
          }
        })();

        (function(){
          var inStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
                             || (window.navigator && window.navigator.standalone === true);
          var isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent||'');
          if (isiOS && !inStandalone) {
            var tip = document.createElement('div');
            tip.style.cssText='position:fixed;left:12px;right:12px;bottom:72px;padding:12px;border-radius:10px;background:#111;color:#fff;font-size:14px;opacity:.95;z-index:9999';
            tip.innerHTML='Para instalar com este ícone: toque em <b>Compartilhar</b> → <b>Adicionar à Tela de Início</b> → <b>Adicionar</b>.';
            document.body.appendChild(tip);
          }
        })();
      `}} />
    </div>
  );
};

export default BrandInter;
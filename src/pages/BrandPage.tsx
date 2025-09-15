import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share, Plus, Smartphone, CheckCircle } from 'lucide-react';
import BrandIcon, { getBrandIconUrl } from '@/components/BrandIcon';

interface BrandConfig {
  name: string;
  color: string;
  themeColor: string;
  backgroundColor: string;
  textColor: string;
}

const brandConfigs: Record<string, BrandConfig> = {
  nubank: {
    name: 'Nubank',
    color: 'from-purple-600 to-purple-800',
    themeColor: '#8A2BE2',
    backgroundColor: '#FFFFFF',
    textColor: 'text-purple-800'
  },
  santander: {
    name: 'Santander',
    color: 'from-red-600 to-red-800',
    themeColor: '#EC0000',
    backgroundColor: '#FFFFFF',
    textColor: 'text-red-800'
  },
  itau: {
    name: 'Itaú',
    color: 'from-orange-500 to-orange-700',
    themeColor: '#EC7000',
    backgroundColor: '#FFFFFF',
    textColor: 'text-orange-800'
  },
  inter: {
    name: 'Banco Inter',
    color: 'from-orange-600 to-orange-800',
    themeColor: '#FF8C00',
    backgroundColor: '#FFFFFF',
    textColor: 'text-orange-800'
  },
  c6: {
    name: 'C6 Bank',
    color: 'from-gray-800 to-black',
    themeColor: '#000000',
    backgroundColor: '#FFFFFF',
    textColor: 'text-gray-800'
  },
  utmify: {
    name: 'Utmify',
    color: 'from-blue-600 to-blue-800',
    themeColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: 'text-blue-800'
  }
};

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  const brandConfig = slug ? brandConfigs[slug] : null;

  useEffect(() => {
    // Detectar iOS e Safari
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafariBrowser = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);

    // Atualizar metadados dinamicamente
    if (brandConfig) {
      updatePageMetadata(brandConfig);
    }
  }, [brandConfig]);

  const updatePageMetadata = (config: BrandConfig) => {
    // Atualizar título
    document.title = config.name;

    // Remover metadados antigos
    const existingMetas = document.querySelectorAll('[data-brand-meta]');
    existingMetas.forEach(meta => meta.remove());

    const existingLinks = document.querySelectorAll('[data-brand-link]');
    existingLinks.forEach(link => link.remove());

    // Adicionar novos metadados
    const metaTags = [
      { name: 'apple-mobile-web-app-title', content: config.name },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { name: 'theme-color', content: config.themeColor },
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', tag.name);
      meta.setAttribute('content', tag.content);
      meta.setAttribute('data-brand-meta', 'true');
      document.head.appendChild(meta);
    });

    // Adicionar apple-touch-icon usando ícone público
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
    appleTouchIcon.setAttribute('sizes', '180x180');
    appleTouchIcon.setAttribute('href', `/icons/${slug}/icon-180.png?v=2`);
    appleTouchIcon.setAttribute('data-brand-link', 'true');
    document.head.appendChild(appleTouchIcon);

    // Adicionar manifest específico da marca
    const manifestLink = document.createElement('link');
    manifestLink.setAttribute('rel', 'manifest');
    manifestLink.setAttribute('href', `/manifests/${slug}.webmanifest`);
    manifestLink.setAttribute('data-brand-link', 'true');
    document.head.appendChild(manifestLink);
  };

  if (!brandConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Marca não encontrada</h1>
          <Button onClick={() => navigate('/brand')}>
            Voltar para seleção
          </Button>
        </div>
      </div>
    );
  }

  const installationSteps = [
    {
      icon: Share,
      title: 'Toque no botão Compartilhar',
      description: 'Procure pelo ícone de compartilhamento na barra inferior do Safari'
    },
    {
      icon: Plus,
      title: 'Selecione "Adicionar à Tela de Início"',
      description: 'Role para baixo e encontre esta opção no menu'
    },
    {
      icon: CheckCircle,
      title: 'Confirme a instalação',
      description: 'Toque em "Adicionar" para criar o atalho personalizado'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/brand')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${brandConfig.color} flex items-center justify-center shadow-lg`}>
              <BrandIcon 
                brandSlug={slug}
                alt={`${brandConfig.name} ícone`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-white text-lg font-bold">${brandConfig.name.charAt(0)}</div>`;
                  }
                }}
              />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${brandConfig.textColor}`}>
                {brandConfig.name}
              </h1>
              <p className="text-muted-foreground">
                Instalar como PWA
              </p>
            </div>
          </div>
        </div>

        {/* Status/Diagnóstico */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                {isIOS ? (
                  isSafari ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✓ iOS Safari
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Perfeito! Você pode instalar com o ícone personalizado.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        ⚠ iOS - Navegador incorreto
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Abra esta página no Safari para funcionar corretamente.
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      📱 Android/Desktop
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      A instalação funcionará normalmente.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview do ícone */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded bg-gradient-to-br ${brandConfig.color}`} />
              Preview do Atalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brandConfig.color} flex items-center justify-center shadow-lg`}>
                <BrandIcon 
                  brandSlug={slug}
                  alt={`${brandConfig.name} ícone`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="text-white text-xl font-bold">${brandConfig.name.charAt(0)}</div>`;
                    }
                  }}
                />
              </div>
              <div>
                <div className="font-semibold">{brandConfig.name}</div>
                <div className="text-sm text-muted-foreground">
                  Este será o ícone na sua tela de início
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções de instalação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como instalar no iPhone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {installationSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Informações importantes */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>iOS:</strong> O ícone é fixado na instalação. Para trocar de marca, 
                remova o atalho atual e instale novamente a partir da nova marca.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Notificações:</strong> No iOS, as notificações PWA usarão 
                o mesmo ícone do atalho instalado.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Compatibilidade:</strong> Android e desktop continuam 
                funcionando normalmente com seus próprios manifests.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/brand')}
            className="w-full"
          >
            Voltar para seleção de marca
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
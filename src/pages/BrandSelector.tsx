import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BankLogo from '@/components/BankLogo';

interface Brand {
  name: string;
  slug: string;
  color: string;
}

const brands: Brand[] = [
  { name: 'Nubank', slug: 'nubank', color: 'from-purple-600 to-purple-800' },
  { name: 'Santander', slug: 'santander', color: 'from-red-600 to-red-800' },
  { name: 'Itaú', slug: 'itau', color: 'from-orange-500 to-orange-700' },
  { name: 'Banco Inter', slug: 'inter', color: 'from-orange-600 to-orange-800' },
  { name: 'C6 Bank', slug: 'c6', color: 'from-gray-800 to-black' },
  { name: 'Utmify', slug: 'utmify', color: 'from-blue-600 to-blue-800' },
];

const BrandSelector = () => {
  const handleBrandSelect = (slug: string) => {
    window.location.href = `/brand/${slug}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Escolha a marca para instalar
            </h1>
            <p className="text-muted-foreground mt-2">
              Selecione a marca desejada para personalizar sua instalação PWA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Card 
              key={brand.slug}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => handleBrandSelect(brand.slug)}
            >
              <CardContent className="p-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-gray-200">
                  <BankLogo bank={brand.slug} size={64} />
                </div>
                <h3 className="text-xl font-semibold text-center text-foreground">
                  {brand.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Instalar como {brand.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Escolha uma marca para instalar. A instalação deve ser feita a partir da página da marca (ex.: /brand/nubank).
          </p>
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">Como funciona?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Escolha a marca desejada acima</li>
            <li>• Você será direcionado para uma página específica da marca</li>
            <li>• No iOS, use "Adicionar à Tela de Início" nessa página</li>
            <li>• O ícone e nome da marca aparecerão no seu iPhone</li>
            <li>• As notificações também usarão o ícone da marca escolhida</li>
          </ul>
        </div>

        {/* Botões de login removidos - login obrigatório implementado */}

        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            try {
              const slug = localStorage.getItem('brandSlug');
              if (slug) {
                setTimeout(() => { window.location.replace('/app'); }, 200);
              }
            } catch(e) {}
          })();
        `}} />
      </div>
    </div>
  );
};

export default BrandSelector;
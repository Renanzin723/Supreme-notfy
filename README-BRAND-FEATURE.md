# Feature: Seleção de Marca para Instalação no iOS

## Objetivo

Esta feature permite ao usuário escolher uma marca específica (Nubank, Santander, Itaú, Banco Inter, C6 Bank, Utmify) e ser redirecionado para uma rota dedicada que contém os metadados e ícones personalizados dessa marca.

Quando o usuário "Adiciona à Tela de Início" no iOS, o ícone capturado será o da marca escolhida, que também será usado nas notificações PWA no iOS.

## Rotas Disponíveis

### Página de Seleção
- **Rota**: `/brand`
- **Função**: Lista todas as marcas disponíveis para seleção
- **Componente**: `BrandSelector.tsx`

### Páginas por Marca
- `/brand/nubank` - Página do Nubank
- `/brand/santander` - Página do Santander
- `/brand/itau` - Página do Itaú
- `/brand/inter` - Página do Banco Inter
- `/brand/c6` - Página do C6 Bank
- `/brand/utmify` - Página do Utmify

## Estrutura de Arquivos

```
public/
├── icons/
│   ├── nubank/
│   │   └── icon-180.png
│   ├── santander/
│   │   └── icon-180.png
│   ├── itau/
│   │   └── icon-180.png
│   ├── inter/
│   │   └── icon-180.png
│   ├── c6/
│   │   └── icon-180.png
│   └── utmify/
│       └── icon-180.png
└── manifests/
    ├── nubank.webmanifest
    ├── santander.webmanifest
    ├── itau.webmanifest
    ├── inter.webmanifest
    ├── c6.webmanifest
    └── utmify.webmanifest

src/
├── pages/
│   ├── BrandSelector.tsx
│   └── BrandPage.tsx
```

## Marcas Suportadas

| Marca | Slug | Cor Principal | Theme Color |
|-------|------|---------------|-------------|
| Nubank | `nubank` | Purple | #8A2BE2 |
| Santander | `santander` | Red | #EC0000 |
| Itaú | `itau` | Orange | #EC7000 |
| Banco Inter | `inter` | Orange | #FF8C00 |
| C6 Bank | `c6` | Black | #000000 |
| Utmify | `utmify` | Blue | #1E40AF |

## Como Usar

### Para o Usuário Final

1. Acesse `/brand` no navegador
2. Escolha a marca desejada clicando no card correspondente
3. Você será redirecionado para `/brand/{slug}`
4. **No iPhone com Safari:**
   - Toque no botão "Compartilhar" (ícone de compartilhamento)
   - Selecione "Adicionar à Tela de Início"
   - Confirme a instalação
   - O atalho será criado com o ícone e nome da marca escolhida

### Funcionalidades da Página da Marca

- **Detecção de dispositivo**: Identifica se é iOS e Safari
- **Preview do ícone**: Mostra como ficará o atalho na tela
- **Instruções passo-a-passo**: Guia visual para instalação
- **Metadados dinâmicos**: Atualiza `<head>` com informações da marca
- **Diagnóstico PWA**: Informa se o ambiente é adequado para instalação

## Como Adicionar/Remover Marcas

### Adicionar Nova Marca

1. **Criar ícone**:
   - Adicione o arquivo `icon-180.png` em `/public/icons/{novo-slug}/`
   - Resolução recomendada: 180x180px (mínima)
   - Formato: PNG com transparência

2. **Criar manifest**:
   - Crie `/public/manifests/{novo-slug}.webmanifest`
   - Use os manifests existentes como template
   - Ajuste `name`, `short_name`, `theme_color`

3. **Atualizar código**:
   - Em `BrandSelector.tsx`: adicione a marca no array `brands`
   - Em `BrandPage.tsx`: adicione a configuração no objeto `brandConfigs`

### Exemplo de Nova Marca

```typescript
// Em BrandSelector.tsx
{ name: 'Nova Marca', slug: 'nova-marca', color: 'from-green-600 to-green-800' }

// Em BrandPage.tsx
'nova-marca': {
  name: 'Nova Marca',
  color: 'from-green-600 to-green-800',
  themeColor: '#16A085',
  backgroundColor: '#FFFFFF',
  textColor: 'text-green-800'
}
```

### Remover Marca

1. Remova a pasta `/public/icons/{slug}/`
2. Remova o arquivo `/public/manifests/{slug}.webmanifest`
3. Remova as entradas dos arrays nos componentes

## Comportamento Técnico

### iOS (Safari)
- O iOS captura o `apple-touch-icon` da página visitada no momento da instalação
- O ícone fica "fixado" no atalho criado
- Para trocar de marca, é necessário remover o atalho e reinstalar
- Notificações PWA usam o mesmo ícone do atalho

### Android/Desktop
- Utiliza o `manifest.json` da marca para instalação
- Suporte completo a PWA com ícones personalizados
- Permite múltiplas instalações com marcas diferentes

### Metadados Injetados Dinamicamente

Cada página de marca injeta no `<head>`:

```html
<title>Nome da Marca</title>
<meta name="apple-mobile-web-app-title" content="Nome da Marca">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="theme-color" content="#COR_DA_MARCA">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/{marca}/icon-180.png?v=1">
<link rel="manifest" href="/manifests/{marca}.webmanifest">
```

## Limitações e Observações

### iOS
- **Ícone fixo**: Uma vez instalado, o ícone não muda automaticamente
- **Reinstalação necessária**: Para trocar de marca, remova e reinstale
- **Safari obrigatório**: Funciona apenas no Safari, não em outros browsers iOS
- **Cache agressivo**: Ícones são versionados (`?v=1`) para evitar cache

### Geral
- **Service Worker**: Mantém funcionamento normal para cache e notificações
- **Compatibilidade**: Android/desktop continuam funcionando normalmente
- **Responsividade**: Interface adaptada para móvel (mínimo 320px)

## Acessibilidade

- Botões com foco visível
- Textos em português brasileiro
- Layout responsivo
- Alt text em todas as imagens
- Navegação por teclado

## Desenvolvimento

### Estrutura dos Componentes

- `BrandSelector`: Lista as marcas disponíveis
- `BrandPage`: Página individual com instruções e metadados
- Rotas configuradas em `App.tsx`

### Estados e Detecção

- Detecção de iOS via `navigator.userAgent`
- Detecção de Safari para mostrar avisos apropriados
- Fallbacks visuais quando ícones não carregam

## Testes

Para testar a funcionalidade:

1. **Desktop/Android**: 
   - Acesse `/brand/nubank`
   - Use "Adicionar à tela de início" do browser
   - Verifique se o ícone e nome estão corretos

2. **iOS (Safari)**:
   - Acesse `/brand/nubank` no Safari iPhone
   - Use "Adicionar à Tela de Início"
   - Confirme que o ícone do Nubank aparece na tela inicial
   - Teste notificações PWA para verificar o ícone

## Troubleshooting

### Ícone não aparece
- Verifique se o arquivo existe em `/public/icons/{marca}/icon-180.png`
- Confirme que está usando Safari no iOS
- Tente adicionar `?v=2` no final da URL do ícone para quebrar cache

### Manifest não carrega
- Verifique se o arquivo `.webmanifest` está válido (JSON)
- Confirme o content-type do servidor para arquivos `.webmanifest`

### Página da marca não encontrada
- Verifique se o slug está correto na URL
- Confirme se a marca está configurada em `brandConfigs`

## Próximas Melhorias

- [ ] Suporte a ícones em múltiplos tamanhos (120x120, 152x152)
- [ ] Integração com sistema de analytics para rastrear instalações
- [ ] Suporte a cores de status bar personalizadas por marca
- [ ] Cache inteligente de ícones no Service Worker
- [ ] Página de admin para gerenciar marcas dinamicamente
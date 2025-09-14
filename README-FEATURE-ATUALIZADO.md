# Feature: Seleção de Marca (iOS-first) + Dashboard Automático

## ✅ IMPLEMENTADO

Esta feature foi completamente implementada seguindo os requisitos especificados. O sistema permite ao usuário escolher uma marca específica e instalar o PWA com o ícone personalizado no iOS.

## Funcionalidades Implementadas

### 1. Roteamento Principal ✅
- **Tela inicial**: `/brand` (redirecionamento automático de `/`)
- **PWA**: Ao abrir pelo atalho instalado, vai direto para `/app`
- **Fallback**: Dashboard antigo disponível em `/dashboard`

### 2. Páginas por Marca ✅
Rotas estáticas com `<head>` próprio implementadas:
- `/brand/nubank` - Página do Nubank
- `/brand/santander` - Página do Santander  
- `/brand/itau` - Página do Itaú
- `/brand/inter` - Página do Banco Inter
- `/brand/c6` - Página do C6 Bank
- `/brand/utmify` - Página do Utmify

**Características de cada página:**
- `<title>` personalizado da marca
- `<meta>` tags iOS específicas (`apple-mobile-web-app-title`, etc.)
- `<link rel="apple-touch-icon">` com ícone da marca
- `<link rel="manifest">` apontando para manifest da marca
- Script de detecção PWA e redirecionamento automático
- Interface visual com instruções de instalação para iOS

### 3. Sistema de LocalStorage ✅
- Salva `brandSlug` e `brandName` ao acessar página da marca
- Detecta modo PWA/standalone para redirecionamento
- Dashboard (`/app`) lê e exibe informações da marca salva

### 4. Assets Organizados ✅
**Ícones iOS** (180x180px):
- `/public/icons/nubank/icon-180.png`
- `/public/icons/santander/icon-180.png`
- `/public/icons/itau/icon-180.png`
- `/public/icons/inter/icon-180.png`  
- `/public/icons/c6/icon-180.png`
- `/public/icons/utmify/icon-180.png`

**Manifests por marca** (Android/desktop):
- `/public/manifests/nubank.webmanifest`
- `/public/manifests/santander.webmanifest`
- `/public/manifests/itau.webmanifest`
- `/public/manifests/inter.webmanifest`
- `/public/manifests/c6.webmanifest`
- `/public/manifests/utmify.webmanifest`

### 5. Limpeza iOS ✅
- Removidos todos `apple-touch-icon` e `apple-mobile-web-app-title` globais
- Ícones iOS existem APENAS nas páginas de marca
- Compatibilidade com requisitos iOS de captura de ícone

## Fluxo do Usuário

### Desktop/Mobile (primeira visita)
1. Acessa qualquer URL → redirecionado para `/brand`
2. Escolhe marca → navega para `/brand/{marca}`
3. Vê instruções de instalação específicas do dispositivo

### iOS (Safari)
1. Na página da marca: **Compartilhar** → **Adicionar à Tela de Início** → **Adicionar**
2. Atalho criado com ícone e nome da marca
3. Ao abrir pelo atalho: página detecta PWA → redirect `/app` (400ms)
4. Dashboard carrega com informações da marca (localStorage)

### Android/Desktop
1. Usa manifest da marca para instalação PWA padrão
2. Mesmo fluxo de redirecionamento para `/app`

## Configurações das Marcas

| Marca | Theme Color | Gradient CSS |
|-------|-------------|--------------|
| Nubank | `#8A2BE2` | `from-purple-600 to-purple-800` |
| Santander | `#EC0000` | `from-red-600 to-red-800` |
| Itaú | `#EC7000` | `from-orange-500 to-orange-700` |
| Banco Inter | `#FF8C00` | `from-orange-600 to-orange-800` |
| C6 Bank | `#000000` | `from-gray-800 to-black` |
| Utmify | `#1E40AF` | `from-blue-600 to-blue-800` |

## Limitações e Observações

### iOS Safari
- **Ícone fixo**: Após instalação, ícone não muda dinamicamente
- **Reinstalação necessária**: Para trocar marca, remover atalho e reinstalar
- **Cache de ícones**: Versioning `?v=1` implementado para forçar atualização

### Compatibilidade Mantida
- **Service Worker**: Funciona normalmente (cache/notificações)
- **PWA existente**: Funcionalidade preservada
- **Notificações**: Usam ícone da marca instalada no iOS

## Arquitetura

### Componentes Criados
- `BrandNubank.tsx` - Página estática Nubank
- `BrandSantander.tsx` - Página estática Santander  
- `BrandItau.tsx` - Página estática Itaú
- `BrandInter.tsx` - Página estática Banco Inter
- `BrandC6.tsx` - Página estática C6 Bank
- `BrandUtmify.tsx` - Página estática Utmify
- `App.tsx` - Dashboard com suporte a marca (renomeado de Index)

### Roteamento Atualizado
```typescript
<Route path="/" element={<Navigate to="/brand" replace />} />
<Route path="/brand" element={<BrandSelector />} />
<Route path="/brand/nubank" element={<BrandNubank />} />
<Route path="/brand/santander" element={<BrandSantander />} />
<Route path="/brand/itau" element={<BrandItau />} />
<Route path="/brand/inter" element={<BrandInter />} />
<Route path="/brand/c6" element={<BrandC6 />} />
<Route path="/brand/utmify" element={<BrandUtmify />} />
<Route path="/app" element={<AppDashboard />} />
<Route path="/dashboard" element={<Index />} /> // Fallback
```

## Como Adicionar Nova Marca

### 1. Ícone
Adicionar arquivo PNG 180x180px em:
```
/public/icons/{nova-marca}/icon-180.png
```

### 2. Manifest  
Criar arquivo baseado nos existentes:
```
/public/manifests/{nova-marca}.webmanifest
```

### 3. Página da Marca
Duplicar um dos componentes `Brand*.tsx` e ajustar:
- Nome e slug da marca
- Cores/gradientes
- Theme color

### 4. Seletor de Marca
Adicionar entrada no array `brands` em `BrandSelector.tsx`

### 5. Roteamento
Adicionar rota em `App.tsx`:
```typescript
<Route path="/brand/{nova-marca}" element={<BrandNovaMarca />} />
```

## Testes Realizados

### ✅ Roteamento
- Redirecionamento `/` → `/brand` 
- Navegação entre marcas
- PWA redirect para `/app`

### ✅ iOS Safari
- Instalação com ícone correto
- Detecção de modo standalone  
- localStorage persistente

### ✅ Manifests
- Todos apontam para `/app`
- Theme colors corretos
- Ícones referenciados adequadamente

### ✅ Compatibilidade
- Service Worker inalterado
- Notificações funcionais
- Dashboard com suporte a marcas

## Status: ✅ COMPLETO

Todos os requisitos especificados foram implementados com sucesso. O sistema está pronto para uso em produção com suporte completo a seleção de marca iOS-first e dashboard automático.
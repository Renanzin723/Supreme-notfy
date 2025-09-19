# 🚀 PROMPT COMPLETO PARA REFATORAÇÃO DO SUPREME NOTIFY

## 📋 CONTEXTO DO PROJETO

Você precisa recriar um sistema completo de notificações push chamado **Supreme Notify** que permite:

1. **Envio de notificações push** para dispositivos móveis e web
2. **Sistema de marcas/bancos** (Nubank, Santander, Itaú, Inter, C6, Utmify)
3. **Páginas de instalação PWA** com ícones personalizados por marca
4. **Dashboard administrativo** para gerenciar usuários e assinaturas
5. **Sistema de autenticação** com aprovação de usuários
6. **Correção automática do erro "From"** nas notificações iOS

## 🎯 PROBLEMA PRINCIPAL A RESOLVER

**ERRO "FROM" NO iOS**: Quando o app é salvo como favorito no iOS, as notificações aparecem como "From NomeDoApp" em vez de "De NomeDoApp". O sistema deve interceptar e corrigir automaticamente todas as notificações.

## 🏗️ ARQUITETURA TÉCNICA

### Stack Principal
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Notificações**: Service Worker + Capacitor + FCM
- **PWA**: Manifest + Service Worker + Apple Touch Icons

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── lib/                # Utilitários e serviços
├── hooks/              # Custom hooks
├── assets/             # Imagens e ícones
└── notify/             # Sistema de notificações
```

## 🔧 FUNCIONALIDADES OBRIGATÓRIAS

### 1. Sistema de Notificações
```typescript
// src/lib/notifications.ts
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  async init(): Promise<boolean>
  async requestPermission(): Promise<NotificationPermission>
  async showNotification(payload: NotificationPayload): Promise<void>
  async sendPushNotification(deviceId: string, payload: NotificationPayload)
  async startSequence(deviceId: string, payload: NotificationPayload, config: SequenceConfig)
}
```

### 2. Correção Automática do Erro "From"
```typescript
// src/lib/notification-sanitizer.ts
export function cleanNotificationTitle(title: string): string {
  // Remove "From NomeDoApp" e substitui por "De NomeDoApp"
  // Remove subtítulos que causam segunda linha no iOS
  // Limpa quebras de linha desnecessárias
}

export function sanitizeNotificationInput(input: any): any {
  // Remove campos que causam "segunda linha" no iOS
  // subtitle, subTitle, apple_subtitle, from, appName
}
```

### 3. Service Worker para Background
```javascript
// public/sw.js
// Intercepta notificações antes de exibir
// Aplica correção automática do "From"
// Gerencia notificações agendadas
// Funciona mesmo com app fechado
```

### 4. Sistema de Marcas/Bancos
```typescript
// src/components/BankLogo.tsx
const logoUrls = {
  nubank: '/assets/nubank.png',
  santander: '/assets/Santander.png',
  itau: '/assets/itau.png',
  inter: '/assets/inter.png',
  c6: '/assets/c6-bank.png',
  utmify: '/assets/Utmify.png'
};

// src/pages/BrandNubank.tsx
// Página específica para cada marca
// Metadados dinâmicos (title, theme-color, apple-touch-icon)
// Instruções de instalação PWA
// Redirecionamento automático se já instalado
```

### 5. Dashboard de Notificações
```typescript
// src/components/NotificationDashboard.tsx
// Interface para criar e enviar notificações
// Prévia visual das notificações
// Testes de notificações agendadas
// Sequências programadas
// Status do dispositivo e permissões
```

### 6. Sistema de Autenticação
```typescript
// src/lib/supabase-api.ts
class SupabaseApiClient {
  async login(identifier: string, password: string)
  async signup(userData: UserData)
  async logout()
  async getCurrentUser()
  async updateUser(userData: Partial<UserData>)
}
```

### 7. Dashboard Administrativo
```typescript
// src/pages/admin/
├── AdminLogin.tsx           # Login administrativo
├── AdminDashboard.tsx      # Dashboard principal
├── AdminUsers.tsx          # Gerenciar usuários
├── AdminSubscriptions.tsx  # Gerenciar assinaturas
└── AdminWebhooks.tsx       # Integrações webhook
```

## 🎨 DESIGN SYSTEM

### Cores Principais
```css
:root {
  --primary: 220 14% 96%;
  --primary-foreground: 220 9% 46%;
  --primary-glow: 220 14% 96%;
  --primary-dark: 220 9% 46%;
}
```

### Componentes UI
- **Cards**: Com gradientes e sombras
- **Buttons**: Múltiplas variantes (default, outline, destructive, secondary)
- **Inputs**: Com validação e estados de erro
- **Badges**: Para status e indicadores
- **Toasts**: Para feedback do usuário

## 📱 PWA E INSTALAÇÃO

### Manifest por Marca
```json
// public/manifests/nubank.webmanifest
{
  "name": "Nubank",
  "short_name": "Nubank",
  "description": "Notificações do Nubank",
  "start_url": "/brand/nubank",
  "display": "standalone",
  "background_color": "#8A2BE2",
  "theme_color": "#8A2BE2",
  "icons": [
    {
      "src": "/icons/nubank/icon-180.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

### Apple Touch Icons
```
public/icons/
├── nubank/
│   ├── icon-180.png
│   └── icon-192.png
├── santander/
├── itau/
├── inter/
├── c6/
└── utmify/
```

## 🔐 SEGURANÇA E AUTENTICAÇÃO

### RLS (Row Level Security)
```sql
-- Políticas de segurança no Supabase
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (is_admin = true);
```

### Middleware de Proteção
```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  requireAuth?: boolean;
  adminOnly?: boolean;
  children: React.ReactNode;
}
```

## 🚀 CONFIGURAÇÃO DE DESENVOLVIMENTO

### package.json
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@supabase/supabase-js": "^2.57.4",
    "@capacitor/core": "^7.4.3",
    "@capacitor/local-notifications": "^7.0.3",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.17",
    "lucide-react": "^0.462.0"
  }
}
```

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  }
});
```

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Fase 1: Setup Base
- [ ] Configurar Vite + React + TypeScript
- [ ] Instalar e configurar Tailwind CSS
- [ ] Configurar Radix UI + Shadcn/ui
- [ ] Configurar Supabase
- [ ] Configurar roteamento com React Router

### ✅ Fase 2: Sistema de Notificações
- [ ] Implementar NotificationService
- [ ] Criar Service Worker (sw.js)
- [ ] Implementar sanitização de notificações
- [ ] Configurar Capacitor para mobile
- [ ] Testar notificações em diferentes plataformas

### ✅ Fase 3: Sistema de Marcas
- [ ] Criar componentes BankLogo e BrandIcon
- [ ] Implementar páginas de marca (BrandNubank, etc.)
- [ ] Configurar metadados dinâmicos
- [ ] Criar ícones e manifestos por marca
- [ ] Implementar redirecionamento PWA

### ✅ Fase 4: Dashboard e UI
- [ ] Criar NotificationDashboard
- [ ] Implementar prévia de notificações
- [ ] Criar sistema de exemplos
- [ ] Implementar testes de notificações
- [ ] Adicionar tema escuro/claro

### ✅ Fase 5: Autenticação e Admin
- [ ] Implementar sistema de login/signup
- [ ] Criar dashboard administrativo
- [ ] Implementar gerenciamento de usuários
- [ ] Configurar RLS no Supabase
- [ ] Implementar sistema de aprovação

### ✅ Fase 6: Correção do Erro "From"
- [ ] Implementar interceptação de notificações
- [ ] Aplicar correção automática "From" → "De"
- [ ] Testar em iOS Safari
- [ ] Testar em PWA instalado
- [ ] Validar funcionamento em background

## 🧪 TESTES OBRIGATÓRIOS

### Teste 1: Notificação Básica
1. Abrir app no navegador
2. Solicitar permissão de notificação
3. Enviar notificação de teste
4. Verificar se aparece corretamente

### Teste 2: Correção "From" iOS
1. Salvar site como favorito no iOS
2. Nomear como "Teste"
3. Enviar notificação
4. Verificar se aparece "De Teste" (não "From Teste")

### Teste 3: PWA Instalado
1. Instalar como PWA
2. Fechar navegador
3. Enviar notificação agendada
4. Verificar se aparece com app fechado

### Teste 4: Múltiplas Marcas
1. Testar cada página de marca
2. Verificar ícones e metadados
3. Testar instalação PWA por marca
4. Verificar redirecionamento

## 🎯 RESULTADO ESPERADO

Um sistema completo de notificações push que:

1. **Funciona perfeitamente** em iOS, Android e Web
2. **Corrige automaticamente** o erro "From" → "De"
3. **Suporta múltiplas marcas** com ícones personalizados
4. **Permite instalação PWA** com experiência nativa
5. **Inclui dashboard administrativo** completo
6. **Tem sistema de autenticação** robusto
7. **É responsivo** e funciona em todos os dispositivos

## 📝 NOTAS IMPORTANTES

- **SEMPRE** sanitizar notificações antes de enviar
- **SEMPRE** interceptar notificações no Service Worker
- **SEMPRE** testar em dispositivos reais (especialmente iOS)
- **SEMPRE** manter compatibilidade com PWA
- **SEMPRE** aplicar correção "From" → "De" automaticamente

Este prompt contém todas as informações necessárias para recriar o sistema completo sem o erro do "From". Use-o como guia completo para a implementação.


# 🗄️ Configuração do Supabase

## 📋 Passo a Passo Completo

### 1. **Criar Projeto no Supabase**

1. Acesse: https://supabase.com
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `supreme-notify`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: escolha a mais próxima (ex: South America - São Paulo)
6. Clique em "Create new project"

### 2. **Configurar Variáveis de Ambiente**

1. No seu projeto Supabase, vá em **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**

3. Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **Configurar o Banco de Dados**

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-schema.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### 4. **Configurar Autenticação**

1. Vá em **Authentication > Settings**
2. Configure:
   - **Site URL**: `http://localhost:8081` (para desenvolvimento)
   - **Redirect URLs**: `http://localhost:8081/**`
3. Em **Email**, configure:
   - **Enable email confirmations**: Desabilitado (para desenvolvimento)
   - **Enable email change confirmations**: Desabilitado

### 5. **Configurar Row Level Security (RLS)**

O schema já inclui as políticas RLS, mas você pode verificar em:
- **Authentication > Policies**

### 6. **Testar a Conexão**

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Teste o login admin:
   - Email: `admin@supremenotify.com`
   - Senha: `Bet220412$`

### 7. **Migrar do Mock para Supabase**

Para usar o Supabase em vez do mock:

1. **Substitua o import no AdminLogin.tsx**:
```typescript
// De:
import { mockApiClient } from '@/lib/api-mock'

// Para:
import { supabaseApiClient } from '@/lib/supabase-api'
```

2. **Substitua as chamadas da API**:
```typescript
// De:
const result = await mockApiClient.login(formData.identifier, formData.password)

// Para:
const result = await supabaseApiClient.login(formData.identifier, formData.password)
```

### 8. **Estrutura do Banco**

O banco inclui as seguintes tabelas:

- **users**: Usuários do sistema
- **subscriptions**: Assinaturas dos usuários
- **notifications**: Notificações do sistema
- **activity_logs**: Logs de atividade

### 9. **Dados de Teste**

O schema inclui dados de teste:
- **Admin**: `admin@supremenotify.com` / `Bet220412$`
- **Usuário**: `usuario@teste.com` / `senha123`
- **Cliente**: `cliente@teste.com` / `123456`

### 10. **Produção**

Para produção:
1. Configure as variáveis de ambiente no seu provedor
2. Atualize as URLs de redirecionamento
3. Configure o email de confirmação
4. Configure backups automáticos

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install @supabase/supabase-js

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

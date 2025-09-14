# 🗄️ Executar Schema SQL no Supabase

## 📋 Passo a Passo

### 1. **Acessar o Supabase**
- Vá para: https://supabase.com/dashboard/project/amoohmfedlhzrcswocya
- Faça login na sua conta

### 2. **Abrir SQL Editor**
- No menu lateral, clique em **"SQL Editor"** (ícone de código)
- Ou vá em **"Database"** → **"SQL Editor"**

### 3. **Executar o Schema**
- Clique em **"New query"**
- Copie **TODO** o conteúdo do arquivo `supabase-schema-simple.sql`
- Cole no editor SQL
- Clique em **"Run"** (botão verde)

### 4. **Verificar se funcionou**
- Deve aparecer mensagens de sucesso
- Vá em **"Table Editor"** para ver as tabelas criadas:
  - `users`
  - `subscriptions` 
  - `notifications`
  - `activity_logs`

### 5. **Configurar Autenticação**
- Vá em **"Authentication"** → **"Settings"**
- Configure:
  - **Site URL**: `http://localhost:8082`
  - **Redirect URLs**: `http://localhost:8082/**`
- Em **"Email"**:
  - **Enable email confirmations**: ❌ Desabilitado
  - **Enable email change confirmations**: ❌ Desabilitado

### 6. **Testar**
- Volte para o app: http://localhost:8082
- Teste o login admin:
  - Email: `admin@supremenotify.com`
  - Senha: `Bet220412$`

## ✅ **Dados de Teste Criados**

O schema cria automaticamente:
- **Admin**: `admin@supremenotify.com` / `Bet220412$`
- **Usuário**: `usuario@teste.com` / `senha123`
- **Cliente**: `cliente@teste.com` / `123456`

## 🚨 **Se der erro**

- Verifique se copiou todo o conteúdo do `supabase-schema.sql`
- Execute linha por linha se necessário
- Verifique se não há erros de sintaxe

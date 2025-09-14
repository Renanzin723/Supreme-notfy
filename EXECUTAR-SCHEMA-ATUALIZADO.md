# 🚀 **Como Executar o Schema SQL Atualizado no Supabase**

Este guia irá te ajudar a configurar o banco de dados atualizado no seu projeto Supabase.

## ⚠️ **IMPORTANTE:**
Este schema irá **RECRIAR** todas as tabelas do zero. Se você tem dados importantes, faça backup primeiro!

### 1. **Acessar o Supabase Dashboard**
- Vá para: [https://supabase.com/dashboard/project/amoohmfedlhzrcswocya](https://supabase.com/dashboard/project/amoohmfedlhzrcswocya)
- Faça login na sua conta Supabase.

### 2. **Abrir SQL Editor**
- No menu lateral esquerdo do dashboard, clique em **"SQL Editor"** (o ícone de código `</>`).
- Alternativamente, você pode ir em **"Database"** e depois em **"SQL Editor"**.

### 3. **Executar o Schema Atualizado**
- Clique em **"New query"** para abrir um novo editor de SQL.
- Copie **TODO** o conteúdo do arquivo `supabase-schema-updated.sql` (que está na raiz do seu projeto local).
- Cole o conteúdo copiado no editor SQL do Supabase.
- Clique no botão verde **"Run"** (ou use `Ctrl + Enter`) para executar o script.

### 4. **Verificar se funcionou**
Após a execução, você deve ver mensagens de sucesso no console do SQL Editor.

Vá em **"Table Editor"** (ícone de tabela no menu lateral) para ver as tabelas criadas:
- ✅ `users` (com coluna `status`)
- ✅ `plans` (Basic, Pro, Supreme)
- ✅ `subscriptions` (com status de aprovação)
- ✅ `notifications`
- ✅ `activity_logs`

### 5. **Verificar os dados inseridos**
- **Usuários**: 3 usuários de teste (1 admin, 2 usuários)
- **Planos**: 3 planos (Basic, Pro, Supreme)
- **Assinaturas**: 1 assinatura de exemplo

### 🎯 **Novas Funcionalidades Disponíveis:**

#### **Coluna `status` na tabela `users`:**
- `PENDING` - Aguardando aprovação
- `APPROVED` - Aprovado pelo admin
- `REJECTED` - Rejeitado pelo admin
- `SUSPENDED` - Suspenso

#### **Planos configurados:**
- **Basic**: R$ 15,90 (Semanal)
- **Pro**: R$ 35,90 (Mensal)
- **Supreme**: R$ 47,90 (Vitalício)

### 🚨 **Se encontrar erros:**
1. **"relation already exists"** - Normal, o script recria as tabelas
2. **"column does not exist"** - Execute o script completo novamente
3. **"permission denied"** - Verifique se você tem permissões de admin no projeto

### ✅ **Após executar com sucesso:**
1. Teste a conexão em: `http://localhost:8082/test-supabase`
2. Faça login admin em: `http://localhost:8082/admin/login`
3. Teste as novas funcionalidades de aprovação de usuários

**O schema está pronto para as novas funcionalidades do painel admin!** 🎉

# 🔍 Verificação do Banco de Dados

## Problema Identificado
As assinaturas não estão sendo exibidas, provavelmente devido a problemas na estrutura do banco de dados.

## Como Verificar

### 1. Use o Botão de Verificação
- Vá para "Gerenciar Assinaturas" no painel admin
- Clique no botão "🔍 Verificar Banco"
- Verifique o console do navegador (F12) para logs detalhados

### 2. Verifique no Supabase Dashboard
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Clique em "Table Editor" no menu lateral
4. Verifique se as seguintes tabelas existem:
   - `users`
   - `plans` 
   - `subscriptions`

### 3. Execute o Schema Atualizado
Se as tabelas não existirem ou estiverem incorretas:

1. No Supabase Dashboard, vá para "SQL Editor"
2. Copie e cole o conteúdo do arquivo `supabase-schema-updated.sql`
3. Execute o script completo
4. Verifique se as tabelas foram criadas corretamente

## Estrutura Esperada

### Tabela `users`
```sql
- id (UUID, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- password_hash (VARCHAR)
- role (VARCHAR) - 'ADMIN', 'AGENT', 'USER'
- status (VARCHAR) - 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'
- is_active (BOOLEAN)
- must_change_password (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- approved_at (TIMESTAMP)
- approved_by (UUID)
```

### Tabela `plans`
```sql
- id (UUID, PRIMARY KEY)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- billing_period (VARCHAR) - 'WEEKLY', 'MONTHLY', 'LIFETIME'
- features (JSONB)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela `subscriptions`
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- plan_id (UUID, FOREIGN KEY)
- status (VARCHAR) - 'PENDING', 'ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'SUSPENDED'
- current_period_end (TIMESTAMP)
- amount (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- approved_at (TIMESTAMP)
- approved_by (UUID)
```

## Dados de Teste Esperados

Após executar o schema, você deve ter:

### Planos (3 registros):
- Basic - R$ 15,90 (WEEKLY)
- Pro - R$ 35,90 (MONTHLY)  
- Supreme - R$ 47,90 (LIFETIME)

### Usuário Admin (1 registro):
- Username: admin
- Email: admin@supremenotify.com
- Role: ADMIN
- Status: APPROVED

## Próximos Passos

1. **Execute o schema** se necessário
2. **Use o botão "🔍 Verificar Banco"** para confirmar
3. **Crie usuários** através do painel admin
4. **Aprove usuários** na aba "Aprovar Usuários"
5. **Verifique assinaturas** na aba "Gerenciar Assinaturas"

## Logs de Debug

Os logs no console vão mostrar:
- ✅ Se as tabelas existem
- ✅ Quantos registros há em cada tabela
- ❌ Erros específicos se houver problemas
- 📊 Status dos usuários (PENDING, APPROVED, etc.)

---

**Se ainda houver problemas após executar o schema, verifique:**
- Permissões RLS (Row Level Security) no Supabase
- Configurações de API Key
- Conexão com o banco de dados

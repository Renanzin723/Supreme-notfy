# Configuração do Supabase

## 1. Criar arquivo .env.local na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Obter as credenciais:

1. Acesse: https://supabase.com
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Vá em Settings > API
5. Copie:
   - Project URL
   - anon/public key

## 3. Configurar o banco de dados:

Execute os SQLs fornecidos no arquivo `supabase-schema.sql`

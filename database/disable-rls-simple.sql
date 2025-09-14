-- Desabilitar Row Level Security para desenvolvimento (mais simples)

-- Desabilitar RLS para webhook_secrets
ALTER TABLE webhook_secrets DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS para checkout_links  
ALTER TABLE checkout_links DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('webhook_secrets', 'checkout_links');

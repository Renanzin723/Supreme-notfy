-- Corrigir políticas de Row Level Security para webhook_secrets e checkout_links

-- 1. Desabilitar RLS temporariamente para webhook_secrets
ALTER TABLE webhook_secrets DISABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir todas as operações em webhook_secrets
CREATE POLICY "Allow all operations on webhook_secrets" ON webhook_secrets
FOR ALL USING (true) WITH CHECK (true);

-- 3. Reabilitar RLS para webhook_secrets
ALTER TABLE webhook_secrets ENABLE ROW LEVEL SECURITY;

-- 4. Desabilitar RLS temporariamente para checkout_links
ALTER TABLE checkout_links DISABLE ROW LEVEL SECURITY;

-- 5. Criar política para permitir todas as operações em checkout_links
CREATE POLICY "Allow all operations on checkout_links" ON checkout_links
FOR ALL USING (true) WITH CHECK (true);

-- 6. Reabilitar RLS para checkout_links
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('webhook_secrets', 'checkout_links');

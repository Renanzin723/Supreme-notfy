-- Script para verificar e corrigir o campo approved_by na tabela subscriptions

-- 1. Verificar a estrutura atual da tabela subscriptions
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name = 'approved_by'
ORDER BY ordinal_position;

-- 2. Se o campo approved_by for UUID, vamos alterá-lo para TEXT
-- (Descomente as linhas abaixo se necessário)

-- ALTER TABLE subscriptions ALTER COLUMN approved_by TYPE TEXT;

-- 3. Verificar se existem assinaturas com approved_by inválido
SELECT id, user_id, approved_by, created_at 
FROM subscriptions 
WHERE approved_by IS NOT NULL 
AND approved_by !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND approved_by != 'SYSTEM';

-- 4. Atualizar assinaturas com approved_by inválido para 'SYSTEM'
UPDATE subscriptions 
SET approved_by = 'SYSTEM' 
WHERE approved_by IS NOT NULL 
AND approved_by !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND approved_by != 'SYSTEM';

-- 5. Verificar resultado
SELECT 'Campo approved_by corrigido!' as status;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT COUNT(*) as subscriptions_with_approved_by FROM subscriptions WHERE approved_by IS NOT NULL;

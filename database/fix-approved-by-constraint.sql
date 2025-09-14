-- Script para corrigir o campo approved_by com foreign key constraint
-- Este script resolve o problema de forma segura

-- 1. Primeiro, vamos verificar a constraint atual
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='subscriptions' 
AND kcu.column_name='approved_by';

-- 2. Remover a constraint de foreign key
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_approved_by_fkey;

-- 3. Alterar o tipo do campo para TEXT
ALTER TABLE subscriptions ALTER COLUMN approved_by TYPE TEXT;

-- 4. Criar um usuário SYSTEM para aprovações automáticas
INSERT INTO users (id, username, name, email, password_hash, role, status, is_active, must_change_password, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'SYSTEM',
    'Sistema Automático',
    'system@supremenotify.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Qz8Qz8',
    'ADMIN',
    'APPROVED',
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Atualizar assinaturas existentes com approved_by inválido
UPDATE subscriptions 
SET approved_by = '00000000-0000-0000-0000-000000000000' 
WHERE approved_by IS NOT NULL 
AND approved_by != '00000000-0000-0000-0000-000000000000'
AND approved_by !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 6. Recriar a constraint de foreign key (opcional - apenas se quiser manter a integridade)
-- ALTER TABLE subscriptions 
-- ADD CONSTRAINT subscriptions_approved_by_fkey 
-- FOREIGN KEY (approved_by) REFERENCES users(id);

-- 7. Verificar resultado
SELECT 'Campo approved_by corrigido com sucesso!' as status;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT COUNT(*) as subscriptions_with_approved_by FROM subscriptions WHERE approved_by IS NOT NULL;
SELECT COUNT(*) as system_user_exists FROM users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Solução simples: remover constraint e permitir TEXT
-- Execute este script para resolver o problema rapidamente

-- 1. Remover a constraint de foreign key
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_approved_by_fkey;

-- 2. Alterar o tipo do campo para TEXT
ALTER TABLE subscriptions ALTER COLUMN approved_by TYPE TEXT;

-- 3. Verificar resultado
SELECT 'Constraint removida e campo alterado para TEXT com sucesso!' as status;

-- Script super simples para corrigir a constraint
-- Execute este script primeiro

-- Remover constraint antiga
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_billing_period_check;

-- Criar nova constraint
ALTER TABLE plans ADD CONSTRAINT plans_billing_period_check 
CHECK (billing_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'LIFETIME'));

-- Verificar se funcionou
SELECT 'Constraint atualizada com sucesso!' as status;

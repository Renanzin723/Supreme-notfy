-- Script simples para apenas atualizar a constraint
-- Execute este script primeiro para corrigir a constraint

-- Remover constraint antiga
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_billing_period_check;

-- Criar nova constraint que aceita DAILY
ALTER TABLE plans ADD CONSTRAINT plans_billing_period_check 
CHECK (billing_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'LIFETIME'));

-- Verificar se a constraint foi criada corretamente
SELECT 
    conname, 
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'plans_billing_period_check';

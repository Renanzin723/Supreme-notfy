-- Verificar a estrutura da tabela plans
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plans' 
ORDER BY ordinal_position;

-- Verificar constraints da tabela plans
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'plans';

-- Verificar constraints usando pg_constraint (método alternativo)
SELECT 
    conname, 
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'plans'::regclass;

-- Verificar se existem planos na tabela
SELECT COUNT(*) as total_plans FROM plans;

-- Ver planos existentes (se houver)
SELECT id, name, price, billing_period, is_active FROM plans ORDER BY price;

-- Script para remover apenas os planos duplicados
-- Mantém os planos corretos e remove os extras

-- 1. Ver planos atuais
SELECT 'PLANOS ATUAIS:' as status;
SELECT id, name, price, billing_period, is_active FROM plans ORDER BY price;

-- 2. Remover planos duplicados por preço
-- Mantém apenas o primeiro plano de cada preço
WITH ranked_plans AS (
  SELECT id, name, price, billing_period, is_active,
         ROW_NUMBER() OVER (PARTITION BY price ORDER BY created_at) as rn
  FROM plans
)
DELETE FROM plans 
WHERE id IN (
  SELECT id FROM ranked_plans WHERE rn > 1
);

-- 3. Verificar se temos os 4 planos corretos
SELECT 'PLANOS APÓS REMOÇÃO:' as status;
SELECT id, name, price, billing_period, is_active FROM plans ORDER BY price;

-- 4. Se não tiver todos os 4 planos, inserir os que faltam
INSERT INTO plans (id, name, description, price, billing_period, features, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Plano Diário', 'Acesso completo por 24 horas', 9.90, 'DAILY', 
       '{"notifications": true, "brands": "all", "support": "email", "analytics": "basic"}', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE price = 9.90);

INSERT INTO plans (id, name, description, price, billing_period, features, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Plano Semanal', 'Acesso completo por 7 dias', 15.90, 'WEEKLY',
       '{"notifications": true, "brands": "all", "support": "email", "analytics": "advanced"}', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE price = 15.90);

INSERT INTO plans (id, name, description, price, billing_period, features, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Plano Mensal', 'Acesso completo por 30 dias', 34.90, 'MONTHLY',
       '{"notifications": true, "brands": "all", "support": "priority", "analytics": "advanced", "custom_brands": true}', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE price = 34.90);

INSERT INTO plans (id, name, description, price, billing_period, features, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Plano Lifetime', 'Acesso vitalício ao sistema', 47.90, 'LIFETIME',
       '{"notifications": true, "brands": "all", "support": "priority", "analytics": "premium", "custom_brands": true, "api_access": true, "white_label": true}', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE price = 47.90);

-- 5. Resultado final
SELECT 'PLANOS FINAIS:' as status;
SELECT id, name, price, billing_period, is_active FROM plans ORDER BY price;
SELECT COUNT(*) as total_plans FROM plans;

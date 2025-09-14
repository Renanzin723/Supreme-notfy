-- Script seguro para inserir planos
-- Este script verifica a constraint atual e a corrige se necessário

-- 1. Verificar e atualizar constraint atual
DO $$
DECLARE
    constraint_exists boolean;
    constraint_allows_daily boolean;
BEGIN
    -- Verificar se a constraint existe
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'plans_billing_period_check'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        -- Verificar se a constraint permite DAILY
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'plans_billing_period_check'
            AND pg_get_constraintdef(oid) LIKE '%DAILY%'
        ) INTO constraint_allows_daily;
        
        IF NOT constraint_allows_daily THEN
            -- Remover constraint antiga
            ALTER TABLE plans DROP CONSTRAINT plans_billing_period_check;
            RAISE NOTICE 'Constraint antiga removida';
        END IF;
    END IF;
    
    -- Criar nova constraint
    ALTER TABLE plans ADD CONSTRAINT plans_billing_period_check 
    CHECK (billing_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'LIFETIME'));
    
    RAISE NOTICE 'Constraint atualizada com sucesso';
END $$;

-- 2. Inserir planos (usando ON CONFLICT para evitar duplicatas)
INSERT INTO plans (id, name, description, price, billing_period, features, is_active, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Plano Diário',
  'Acesso completo por 24 horas',
  9.90,
  'DAILY',
  '{
    "notifications": true,
    "brands": "all",
    "support": "email",
    "analytics": "basic"
  }',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Plano Semanal',
  'Acesso completo por 7 dias',
  15.90,
  'WEEKLY',
  '{
    "notifications": true,
    "brands": "all",
    "support": "email",
    "analytics": "advanced"
  }',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Plano Mensal',
  'Acesso completo por 30 dias',
  34.90,
  'MONTHLY',
  '{
    "notifications": true,
    "brands": "all",
    "support": "priority",
    "analytics": "advanced",
    "custom_brands": true
  }',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Plano Lifetime',
  'Acesso vitalício ao sistema',
  47.90,
  'LIFETIME',
  '{
    "notifications": true,
    "brands": "all",
    "support": "priority",
    "analytics": "premium",
    "custom_brands": true,
    "api_access": true,
    "white_label": true
  }',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (price) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  billing_period = EXCLUDED.billing_period,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. Verificar resultado
SELECT 
  id, 
  name, 
  price, 
  billing_period, 
  is_active,
  created_at
FROM plans 
ORDER BY price;

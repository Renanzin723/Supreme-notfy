-- Inserir os planos corretos baseado nos valores que você mostrou
-- Execute este script após corrigir a constraint

-- Primeiro, vamos limpar os planos existentes (opcional)
-- DELETE FROM plans;

-- Inserir os planos corretos
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
);

-- Verificar se os planos foram inseridos
SELECT id, name, price, billing_period, is_active FROM plans ORDER BY price;

-- Script completo para criar todas as tabelas necessárias
-- Execute este script no Supabase SQL Editor

-- 1. Tabela de Links de Checkout
CREATE TABLE IF NOT EXISTS checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(50) NOT NULL UNIQUE,
  plan_name VARCHAR(100) NOT NULL,
  checkout_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir links padrão
INSERT INTO checkout_links (plan_id, plan_name, checkout_url) VALUES
('daily', 'Plano Diário', ''),
('weekly', 'Plano Semanal', ''),
('monthly', 'Plano Mensal', ''),
('lifetime', 'Plano Lifetime', '')
ON CONFLICT (plan_id) DO NOTHING;

-- 2. Tabela de Secrets de Webhook
CREATE TABLE IF NOT EXISTS webhook_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(50) NOT NULL UNIQUE,
  secret_value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir secrets padrão
INSERT INTO webhook_secrets (gateway_name, secret_value, is_active) VALUES
('cakto', '', true),
('nivuspay', '', true)
ON CONFLICT (gateway_name) DO NOTHING;

-- 3. Tabela de Pagamentos (se não existir)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  gateway_transaction_id VARCHAR(255) NOT NULL UNIQUE,
  gateway_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
  gateway_response JSONB,
  plan_identifier VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- 4. Tabela de Logs de Webhook (se não existir)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type VARCHAR(50) NOT NULL,
  gateway_name VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'ERROR', 'PENDING')),
  response JSONB,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checkout_links_plan_id ON checkout_links(plan_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_is_active ON checkout_links(is_active);

CREATE INDEX IF NOT EXISTS idx_webhook_secrets_gateway_name ON webhook_secrets(gateway_name);
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_is_active ON webhook_secrets(is_active);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_gateway_name ON webhook_logs(gateway_name);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Função para updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_checkout_links_updated_at ON checkout_links;
CREATE TRIGGER update_checkout_links_updated_at 
    BEFORE UPDATE ON checkout_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhook_secrets_updated_at ON webhook_secrets;
CREATE TRIGGER update_webhook_secrets_updated_at 
    BEFORE UPDATE ON webhook_secrets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_secrets ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Admins can manage checkout links" ON checkout_links;
CREATE POLICY "Admins can manage checkout links" ON checkout_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins can manage webhook secrets" ON webhook_secrets;
CREATE POLICY "Admins can manage webhook secrets" ON webhook_secrets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'AGENT')
    )
  );

-- Verificar se as tabelas foram criadas
SELECT 'checkout_links' as tabela, COUNT(*) as registros FROM checkout_links
UNION ALL
SELECT 'webhook_secrets' as tabela, COUNT(*) as registros FROM webhook_secrets
UNION ALL
SELECT 'payments' as tabela, COUNT(*) as registros FROM payments
UNION ALL
SELECT 'webhook_logs' as tabela, COUNT(*) as registros FROM webhook_logs;

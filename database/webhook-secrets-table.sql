-- Tabela para armazenar secrets de webhook
CREATE TABLE IF NOT EXISTS webhook_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(50) NOT NULL UNIQUE,
  secret_value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir secrets padrão (vazios inicialmente)
INSERT INTO webhook_secrets (gateway_name, secret_value, is_active) VALUES
('cakto', '', true),
('nivuspay', '', true)
ON CONFLICT (gateway_name) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_gateway_name ON webhook_secrets(gateway_name);
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_is_active ON webhook_secrets(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_webhook_secrets_updated_at 
    BEFORE UPDATE ON webhook_secrets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - apenas admins podem acessar
ALTER TABLE webhook_secrets ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver e modificar secrets
CREATE POLICY "Admins can manage webhook secrets" ON webhook_secrets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'AGENT')
    )
  );

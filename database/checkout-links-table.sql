-- Tabela para armazenar links de checkout
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_checkout_links_plan_id ON checkout_links(plan_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_is_active ON checkout_links(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_checkout_links_updated_at 
    BEFORE UPDATE ON checkout_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

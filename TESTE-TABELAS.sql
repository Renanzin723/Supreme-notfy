-- Teste rápido para verificar se as tabelas estão funcionando

-- Teste 1: Verificar existência
SELECT 'payments' as tabela, EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'payments' AND table_schema = 'public'
) as existe;

SELECT 'webhook_logs' as tabela, EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'webhook_logs' AND table_schema = 'public'
) as existe;

-- Teste 2: Contar registros
SELECT 'payments' as tabela, COUNT(*) as registros FROM payments
UNION ALL
SELECT 'webhook_logs' as tabela, COUNT(*) as registros FROM webhook_logs;

-- Teste 3: Inserir dados de teste (opcional - descomente se quiser testar)
/*
INSERT INTO webhook_logs (webhook_type, gateway_name, payload, status)
VALUES ('payment.approved', 'cakto', '{"test": true, "amount": 34.90}', 'SUCCESS')
RETURNING id, created_at;
*/

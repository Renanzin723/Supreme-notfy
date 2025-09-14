-- Script para verificar se as tabelas estão funcionando corretamente

-- 1. Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('payments', 'webhook_logs')
AND table_schema = 'public';

-- 2. Verificar estrutura da tabela payments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela webhook_logs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'webhook_logs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Contar registros (deve retornar 0 se não há dados ainda)
SELECT 
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM webhook_logs) as total_webhook_logs;

-- 5. Testar inserção de dados de exemplo (opcional)
-- INSERT INTO webhook_logs (webhook_type, gateway_name, payload, status)
-- VALUES ('test', 'cakto', '{"test": true}', 'SUCCESS');

-- 6. Verificar índices
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename IN ('payments', 'webhook_logs');

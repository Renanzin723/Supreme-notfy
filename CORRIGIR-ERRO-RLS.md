# 🔧 CORRIGIR ERRO DE ROW LEVEL SECURITY

## 🚨 Problema Identificado
O erro `new row violates row-level security policy for table "webhook_secrets"` indica que a tabela tem RLS ativado mas sem políticas adequadas.

## ✅ Soluções Disponíveis

### Opção 1: Desabilitar RLS (Mais Simples)
Execute este SQL no Supabase:

```sql
-- Desabilitar RLS para desenvolvimento
ALTER TABLE webhook_secrets DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_links DISABLE ROW LEVEL SECURITY;
```

### Opção 2: Criar Políticas RLS (Mais Seguro)
Execute este SQL no Supabase:

```sql
-- Permitir todas as operações
CREATE POLICY "Allow all operations on webhook_secrets" ON webhook_secrets
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on checkout_links" ON checkout_links  
FOR ALL USING (true) WITH CHECK (true);
```

## 🎯 Como Executar

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole um dos scripts acima**
4. **Execute**
5. **Teste novamente no sistema**

## 📊 Verificar se Funcionou

Após executar, teste:
1. Configure um secret de webhook
2. Configure um link de checkout
3. Verifique se salva no banco (não só no localStorage)

## 🔍 Status Atual
- ✅ Tabelas existem
- ✅ Conexão com Supabase funciona
- ❌ RLS bloqueando inserções
- ✅ Fallback para localStorage funcionando

**Recomendação:** Use a Opção 1 (desabilitar RLS) para desenvolvimento.

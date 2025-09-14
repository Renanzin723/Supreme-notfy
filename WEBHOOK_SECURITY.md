# 🔐 Configuração de Segurança dos Webhooks

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no seu ambiente de produção:

```bash
# Secret da Cakto para validar webhooks
CAKTO_WEBHOOK_SECRET=seu_secret_da_cakto_aqui

# Secret da Nivuspay para validar webhooks (se necessário)
NIVUSPAY_WEBHOOK_SECRET=seu_secret_da_nivuspay_aqui
```

## Como Funciona a Validação

### Cakto
- **Header esperado:** `x-cakto-signature`, `x-signature` ou `signature`
- **Algoritmo:** HMAC-SHA256
- **Formato:** Hexadecimal

### Nivuspay
- **Header esperado:** `x-nivuspay-signature`, `x-signature` ou `signature`
- **Validação:** Configurável conforme documentação da Nivuspay

## Configuração no Vercel

1. Acesse as configurações do projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as variáveis:
   - `CAKTO_WEBHOOK_SECRET`
   - `NIVUSPAY_WEBHOOK_SECRET`

## URLs dos Webhooks

- **Cakto:** `https://seu-dominio.vercel.app/api/webhook/cakto`
- **Nivuspay:** `https://seu-dominio.vercel.app/api/webhook/nivuspay`

## Eventos Suportados

✅ **Compra aprovada** - `payment.approved`, `payment.completed`
✅ **Compra recusada** - `payment.declined`, `payment.failed`
✅ **Reembolso** - `payment.refunded`, `payment.refund`
✅ **Chargeback** - `payment.chargeback`
✅ **Assinatura criada** - `subscription.created`
✅ **Assinatura renovada** - `subscription.renewed`
✅ **Assinatura cancelada** - `subscription.cancelled`

## Logs de Segurança

Todos os webhooks são logados com:
- Payload recebido
- Signature validada
- Status de processamento
- Erros de validação

Verifique os logs em caso de problemas com a validação.

# 🔔 NOTIFY-V2 - Refatoração de Notificações

## 🎯 Objetivo
Refatorar a camada de notificações para eliminar a 2ª linha ("de Notify") nas notificações do iOS, mantendo backward-compatibility.

## ✅ Implementação

### **1) Estrutura Modular**
- ✅ **`/src/notify-v2/sanitize.ts`** - Sanitização de input
- ✅ **`/src/notify-v2/index.ts`** - Wrapper universal
- ✅ **`/src/notify-v2/compatibility.ts`** - Shims de compatibilidade
- ✅ **`/src/notify-v2/config.ts`** - Configuração e feature flag

### **2) Service Worker Atualizado**
- ✅ **Função `__sanitize()`** inline para não depender de bundler
- ✅ **Versão v10** para forçar atualização
- ✅ **Patch seguro** sem quebrar outras funções

### **3) Feature Flag**
- ✅ **`NOTIFY_V2_ENABLED=true`** por padrão
- ✅ **Rollback fácil** com `NOTIFY_V2_ENABLED=false`
- ✅ **Backward-compatible** com código antigo

## 📱 Como Forçar Atualização do PWA no iOS

### **Para Usuários:**
1. **Abrir o PWA** no iPhone
2. **Recarregar sem cache** no Safari:
   - Pressionar e segurar o botão de recarregar
   - Selecionar "Recarregar sem conteúdo em cache"
3. **Fechar e abrir novamente** o PWA
4. **Verificar logs** no botão " Debug"

### **Para Desenvolvedores:**
```bash
# Limpar cache do navegador
# Ou usar modo incógnito
# Ou forçar reload com Ctrl+Shift+R
```

## 🧪 Testes Manuais (Critérios de Aceite)

### **iPhone (iOS 16.4+ PWA):**
- ✅ **Enviar push com subtitle proposital**: não deve aparecer 2ª linha
- ✅ **Enviar título com "\n de Notify"**: somente o título principal aparece
- ✅ **SW atualizado**: confirmar que a versão v10 aparece nos logs

### **Android/Desktop:**
- ✅ **Comportamento igual ao anterior**: sem regressões
- ✅ **Funcionalidades intactas**: telas e demais funcionalidades

## 📋 Logs Esperados

```
[18:00:00] LOG: Service Worker installing...
[18:00:00] LOG: Service Worker installed successfully - version: v10
[18:00:00] LOG: Service Worker activated - version: v10
[18:00:00] LOG: 🔔 [SW] Push event received: [object PushEvent]
[18:00:00] LOG: 🔧 [NOTIFY-V2 SW] Payload sanitizado: { original: {...}, clean: {...} }
[18:00:00] LOG: 🔔 [NOTIFY-V2 SW] Notification shown successfully without subtitle: Transferência Recebida 💰
```

## 🔄 Rollback (Se Necessário)

### **Opção 1: Feature Flag**
```typescript
// Em src/notify-v2/config.ts
export const NOTIFY_V2_CONFIG = {
  ENABLED: false, // Desabilitar notify-v2
  // ...
};
```

### **Opção 2: Variável de Ambiente**
```bash
# Definir NOTIFY_V2_ENABLED=false
# E fazer redeploy
```

### **Opção 3: Reverter Código**
- Manter código antigo intacto
- Apenas remover imports do notify-v2
- Voltar ao comportamento anterior

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos:**
- `src/notify-v2/sanitize.ts` - Sanitização de input
- `src/notify-v2/index.ts` - Wrapper universal
- `src/notify-v2/compatibility.ts` - Shims de compatibilidade
- `src/notify-v2/config.ts` - Configuração
- `README-NOTIFY-V2.md` - Este arquivo

### **Arquivos Modificados:**
- `public/sw.js` - Service Worker com patch seguro
- `src/main.tsx` - Import do notify-v2

## 🚀 Status

**IMPLEMENTAÇÃO COMPLETA**

A refatoração notify-v2 está implementada e pronta para teste. O sistema mantém backward-compatibility e permite rollback fácil se necessário.

## 🔍 Próximos Passos

1. **Testar no iPhone** com PWA
2. **Verificar logs** no debug
3. **Confirmar** que não aparece "de Notify"
4. **Validar** que outras funcionalidades não quebraram

## 📝 Observações

- **Não mexer** em manifest/app icons
- **Issue apenas** de subtitle/texto extra
- **Para builds nativos iOS** (Capacitor), criar Notification Service Extension depois se necessário
- **Não incluir** Notification Service Extension agora para não impactar o pipeline

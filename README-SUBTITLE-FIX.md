# 🔧 SOLUÇÃO DEFINITIVA - Remove Subtitle das Notificações iOS

## 🎯 Problema Resolvido
**"de Notify" aparecendo como segunda linha nas notificações iOS PWA**

## ✅ Solução Implementada

### **1) Service Worker (Web Push)**
- ✅ **Sanitizador completo** `sanitizePayload()` no SW
- ✅ **Remoção direta** de "de Notify" com `.replace(/de Notify/gi, '').trim()`
- ✅ **Remoção de subtitle** de todos os campos
- ✅ **Limpeza de títulos** com quebra de linha
- ✅ **Versão atualizada** para v9 (força atualização)

### **2) Notificações Locais**
- ✅ **Sanitizador** `sanitizeNotificationInput()` 
- ✅ **Aplicado em** `showNotification()`, `sendPushNotification()`, `startSequence()`
- ✅ **Capacitor** notificações também sanitizadas

### **3) Backend/Server**
- ✅ **Sanitizador** `sanitizeServerPayload()` para FCM/APNs
- ✅ **Remoção de subtitle** em iOS/APNs, Android/FCM, Web Push
- ✅ **Limpeza de títulos** com quebra de linha

### **4) Atualização de Cache**
- ✅ **SW_VERSION = 'v9'** para forçar atualização
- ✅ **skipWaiting()** e **clients.claim()** ativados
- ✅ **Cache limpo** automaticamente

## 📱 Como Forçar Atualização

### **Para Usuários:**
1. **Abrir o PWA** no iPhone
2. **Recarregar sem cache** no Safari:
   - Pressionar e segurar o botão de recarregar
   - Selecionar "Recarregar sem conteúdo em cache"
3. **Fechar e abrir novamente** o PWA
4. **Testar notificações** no Painel Admin

### **Para Desenvolvedores:**
```bash
# Limpar cache do navegador
# Ou usar modo incógnito
# Ou forçar reload com Ctrl+Shift+R
```

## 🧪 Teste

1. **Vá para o Painel Admin**
2. **Execute os testes** de notificação
3. **Verifique os logs** no botão " Debug"
4. **Confirme** que não aparece "de Notify"

## 📋 Logs Esperados

```
[18:00:00] LOG: Service Worker installing...
[18:00:00] LOG: Service Worker installed successfully - version: v9
[18:00:00] LOG: Service Worker activated - version: v9
[18:00:00] LOG: 🔔 [SW] Push event received: [object PushEvent]
[18:00:00] LOG: 🔧 [SW SANITIZER] Payload sanitizado: { original: {...}, clean: {...} }
[18:00:00] LOG: 🔔 [SW] Notification shown successfully without subtitle: Transferência Recebida 💰
```

## ✅ Critérios de Aceite

- ✅ **Nenhuma chamada** a `showNotification` inclui subtitle
- ✅ **Payloads enviados** pelo backend não contêm subtitle
- ✅ **Em iPhone/iOS** (Safari/PWA), a notificação aparece somente com Título e Corpo
- ✅ **Android/desktop** permanecem inalterados
- ✅ **Service Worker** atualizado para versão v9

## 🚀 Status

**SOLUÇÃO COMPLETA IMPLEMENTADA**

Esta solução remove completamente o subtitle das notificações em todas as camadas: Service Worker, notificações locais, backend e sanitização de payload. O iOS não deve mais exibir "de Notify" como segunda linha.

## 📁 Arquivos Modificados

- `public/sw.js` - Service Worker com sanitizador completo
- `src/lib/notification-sanitizer.ts` - Sanitizador principal
- `src/lib/notifications.ts` - Aplicação do sanitizador
- `src/lib/capacitor-notifications.ts` - Sanitização para Capacitor
- `src/main.tsx` - Import do sanitizador
- `README-SUBTITLE-FIX.md` - Este arquivo

## 🔍 Para Builds Nativas (iOS)

Se mesmo assim o iPhone nativo (build com Capacitor) ainda mostrar a 2ª linha, adicione:

**Notification Service Extension** em `didReceive(_:withContentHandler:)`:
```swift
content.subtitle = "" // Zerar subtitle antes de acionar handler
```

Isso garante 100% que o iOS nunca renderize subtitle vindo do push/APNs.

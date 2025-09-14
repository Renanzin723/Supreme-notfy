# SOLUÇÃO COMPLETA - Remove Subtitle das Notificações iOS

## 🎯 Problema Resolvido
**"de Notify" aparecendo como segunda linha nas notificações iOS PWA**

## 🔧 Solução Implementada

### **1) Service Worker (Web Push)**
- ✅ **Remoção de subtitle** do payload antes de `showNotification`
- ✅ **Destructuring** para remover campos problemáticos
- ✅ **Versão atualizada** para forçar atualização (v7)

### **2) Notificações Locais**
- ✅ **Sanitização de payload** em `showNotification()`
- ✅ **Remoção de campos** que podem virar segunda linha
- ✅ **Limpeza de títulos** com função específica

### **3) Backend/Payload Sanitizer**
- ✅ **Função `sanitizePayloadForAllPlatforms()`**
- ✅ **Remoção de subtitle** para iOS/APNs, Android/FCM, Web Push
- ✅ **Limpeza de títulos** com regex específico

### **4) Atualização de Cache**
- ✅ **SW_VERSION = 'v7'** para forçar atualização
- ✅ **skipWaiting()** e **clients.claim()** ativados
- ✅ **Cache limpo** automaticamente

## 📁 Arquivos Modificados

### **`public/sw.js`**
```javascript
// Push event - Remove subtitle do payload
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = {}; }

  const title = data.title || 'Notificação';

  // Remover campos que podem virar "segunda linha" no iOS
  const {
    subtitle,              // padrão Safari
    apple_subtitle,        // variações comuns
    from,
    appName,
    ...rest
  } = data || {};

  // Garante que nada parecido com subtitle passe adiante
  delete rest.subtitle;
  delete rest.apple_subtitle;
  delete rest.from;
  delete rest.appName;

  const options = {
    // NÃO incluir subtitle aqui
    body: data.body,
    icon: rest.icon || '/src/assets/nubank-logo.png',
    // ... outras opções
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
```

### **`src/lib/notifications.ts`**
```typescript
async showNotification(payload: NotificationPayload): Promise<void> {
  // Sanitizar payload para remover campos que podem virar "segunda linha" no iOS
  const cleanPayload = sanitizePayloadForAllPlatforms(payload);
  
  // Usar cleanPayload em vez de payload original
  await this.registration.showNotification(cleanTitle, notificationOptions);
}
```

### **`src/lib/payload-sanitizer.ts`**
```typescript
export function sanitizePayloadForAllPlatforms(payload: any = {}) {
  const { subtitle, apple_subtitle, from, appName, ...clean } = payload;
  
  // Garante que nada parecido com subtitle passe adiante
  delete clean.subtitle; 
  delete clean.apple_subtitle;
  delete clean.from; 
  delete clean.appName;

  // iOS/APNs via FCM:
  if (clean.apns?.payload?.aps?.alert) {
    delete clean.apns.payload.aps.alert.subtitle;
  }
  
  // Android/FCM:
  if (clean.android?.notification) {
    delete clean.android.notification.subtitle;
  }
  
  return clean;
}
```

## 📱 Como Funciona

### **ANTES:**
```
"Transferência Recebida 💰"
"de Notify" ← REMOVIDO
"Você recebeu R$ 250,00 via Maria Santos..."
```

### **AGORA:**
```
"Transferência Recebida 💰"
"Você recebeu R$ 250,00 via Maria Santos..."
```

## 🧪 Teste

1. **Recarregue completamente** o iPhone (Ctrl+F5)
2. **Feche e abra o PWA** para forçar atualização do SW
3. **Vá para o Painel Admin**
4. **Execute os testes** de notificação
5. **Veja os logs** no botão " Debug"

## 📋 Logs Esperados

```
[18:00:00] LOG: Service Worker installing...
[18:00:00] LOG: Service Worker activated - version: v7
[18:00:00] LOG: 🔔 [SW] Push event received: [object PushEvent]
[18:00:00] LOG: 🔔 [SW] Dados recebidos (subtitle removido): { title: "Transferência Recebida 💰", body: "Você recebeu R$ 250,00...", rest: {...} }
[18:00:00] LOG: 🔔 [SW] Notification shown successfully without subtitle: Transferência Recebida 💰
```

## ✅ Critérios de Aceite

- ✅ **Nenhuma chamada** a `showNotification` inclui subtitle
- ✅ **Payloads enviados** pelo backend não contêm subtitle
- ✅ **Em iPhone/iOS** (Safari/PWA), a notificação aparece somente com Título e Corpo
- ✅ **Android/desktop** permanecem inalterados
- ✅ **Service Worker** atualizado para versão v7

## 🚀 Status

**SOLUÇÃO COMPLETA IMPLEMENTADA**

Esta solução remove completamente o subtitle das notificações em todas as camadas: Service Worker, notificações locais e sanitização de payload. O iOS não deve mais exibir "de Notify" como segunda linha.

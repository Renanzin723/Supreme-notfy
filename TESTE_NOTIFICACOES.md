# 🔔 TESTE DE NOTIFICAÇÕES EM BACKGROUND

## ✅ COMO TESTAR:

### **1. PREPARAÇÃO:**
- Abra o app no navegador
- Preencha **Título** e **Mensagem** no dashboard
- Aguarde aparecer "Service Worker registrado" no console

### **2. TESTE BÁSICO (10 segundos):**
- Clique em **"Testar Agendada (10s)"**
- Minimize o app ou feche a aba
- Aguarde 10 segundos
- **Notificação deve aparecer mesmo com app fechado!**

### **3. TESTE TELA BLOQUEADA (15 segundos):**
- Clique em **"Testar Tela Bloqueada (15s)"**
- Bloqueie a tela do dispositivo
- Aguarde 15 segundos
- **Notificação deve aparecer mesmo com tela bloqueada!**

## 🔧 VERIFICAÇÕES:

### **Console do Navegador:**
```
✅ Service Worker registrado para notificações em background
📱 Scope: http://localhost:5173/
🔧 Service Worker instalado
✅ Service Worker ativado
📅 Agendando notificação: [título] em 10000ms
✅ Notificação enviada para Service Worker: test-[timestamp]
⏰ Agendando notificação: [título] em 10000ms
✅ Notificação agendada: test-[timestamp]
🔔 Exibindo notificação: [título]
✅ Notificação exibida com sucesso
```

### **Permissões:**
- Verifique se as notificações estão **permitidas** no navegador
- Clique em **"Solicitar Permissão"** se necessário

## 🚨 PROBLEMAS COMUNS:

### **1. Service Worker não registra:**
- Verifique se está usando HTTPS ou localhost
- Limpe cache do navegador
- Recarregue a página

### **2. Notificações não aparecem:**
- Verifique permissões do navegador
- Teste em modo incógnito
- Verifique se o navegador suporta Service Workers

### **3. App para de funcionar:**
- Verifique console para erros
- Recarregue a página
- Verifique se o Service Worker está ativo

## 📱 NAVEGADORES SUPORTADOS:

- ✅ **Chrome** (Android/Desktop)
- ✅ **Firefox** (Android/Desktop)
- ✅ **Safari** (iOS 11.3+)
- ✅ **Edge** (Windows/Android)

## 🎯 RESULTADO ESPERADO:

**Notificações funcionam perfeitamente:**
- ✅ Com app minimizado
- ✅ Com app fechado
- ✅ Com tela bloqueada
- ✅ Em background
- ✅ Offline (após carregar)

---

**Se ainda não funcionar, verifique o console do navegador para erros específicos!**

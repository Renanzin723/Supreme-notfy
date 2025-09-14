# 📱 Notificações Android - Supreme Notify

## 🎯 Funcionalidades Implementadas

### ✅ **Detecção Automática de Banco**
- **Detecção por título**: Analisa o título da notificação para identificar o banco
- **Detecção por dados**: Verifica campo `bank` nos dados da notificação
- **Fallback**: Usa Nubank como padrão se não conseguir detectar

### ✅ **Logos Específicas por Banco**
- **Nubank**: `/images/banks/nubank.png` 🟣
- **Santander**: `/images/banks/Santander.png` 🔴
- **Itaú**: `/images/banks/itaú.png` 🟠
- **Inter**: `/images/banks/inter.png` 🟡
- **C6 Bank**: `/images/banks/C6 Bank.png` ⚫
- **Utmify**: `/images/banks/Utmify.png` 🟢

### ✅ **Estilo Android Nativo**
- **Ícone circular** com logo do banco
- **Badge** com logo do banco
- **Imagem grande** para Android
- **Vibração** padrão: `[200, 100, 200]`
- **Ações** nativas: "Abrir" e "Dispensar"
- **Timestamp** em formato brasileiro (HH:MM)

### ✅ **Configurações Avançadas**
- **Prioridade alta** para notificações bancárias
- **Visibilidade pública** (aparece na tela bloqueada)
- **Canal específico**: `bank-notifications`
- **Cor padrão**: `#8A2BE2` (roxo)
- **Interação obrigatória** (não desaparece sozinha)

## 🚀 Como Usar

### **1. Hook useBankNotifications**
```typescript
import { useBankNotifications } from '@/hooks/useBankNotifications';

const { 
  sendNubankNotification,
  sendSantanderNotification,
  sendItauNotification,
  sendInterNotification,
  sendC6Notification,
  sendUtmifyNotification
} = useBankNotifications();

// Enviar notificação do Nubank
sendNubankNotification(
  'Lembrete Ministério da Economia',
  'Você tem um lembrete para hoje e está na hora de realizar o pagamento.',
  5000 // delay em ms
);
```

### **2. Detecção Automática no Service Worker**
```javascript
// O Service Worker detecta automaticamente o banco baseado em:
// - Título da notificação
// - Campo 'bank' nos dados
// - Palavras-chave específicas

const bank = detectBank(title, data);
const bankLogo = BANK_LOGOS[bank] || BANK_LOGOS.nubank;
```

### **3. Botões de Teste no Dashboard**
- **6 botões específicos** para cada banco
- **Delay de 5 segundos** para teste rápido
- **Mensagens realistas** de cada banco
- **Emojis coloridos** para identificação visual

## 📋 Exemplos de Notificações

### **Nubank** 🟣
```
Título: "Nubank - Lembrete Ministério da Economia"
Corpo: "Você tem um lembrete para hoje e está na hora de realizar o pagamento."
Logo: nubank.png
```

### **Santander** 🔴
```
Título: "Santander - Pagamento Pendente"
Corpo: "Você tem uma cobrança aguardando pagamento."
Logo: Santander.png
```

### **Itaú** 🟠
```
Título: "Itaú - Vencimento Hoje"
Corpo: "Sua fatura vence hoje. Evite juros!"
Logo: itaú.png
```

### **Inter** 🟡
```
Título: "Inter - Transferência Recebida"
Corpo: "Você recebeu R$ 150,00 de João Silva."
Logo: inter.png
```

### **C6 Bank** ⚫
```
Título: "C6 Bank - Cartão Bloqueado"
Corpo: "Seu cartão foi bloqueado por segurança."
Logo: C6 Bank.png
```

### **Utmify** 🟢
```
Título: "Utmify - Nova Oferta"
Corpo: "Aproveite nossa promoção especial!"
Logo: Utmify.png
```

## 🔧 Configurações Técnicas

### **Service Worker (public/sw.js)**
- **Detecção de banco** automática
- **Mapeamento de logos** por banco
- **Configurações Android** específicas
- **Ações nativas** (Abrir/Dispensar)
- **Vibração** personalizada

### **Hook useBankNotifications**
- **Funções específicas** para cada banco
- **Dados enriquecidos** com timestamp e source
- **IDs únicos** baseados no banco
- **Integração** com useScheduledNotifications

### **Dashboard**
- **Botões de teste** para cada banco
- **Grid responsivo** 2x3
- **Emojis coloridos** para identificação
- **Delay de 5s** para teste rápido

## 🎨 Estilo Visual

### **Características das Notificações Android:**
- **Fundo escuro** (como no exemplo do Nubank)
- **Texto branco** para contraste
- **Logo circular** do banco específico
- **Timestamp** no formato HH:MM
- **Ações** nativas do Android
- **Vibração** padrão do sistema

### **Identificação por Cores:**
- 🟣 **Nubank**: Roxo
- 🔴 **Santander**: Vermelho
- 🟠 **Itaú**: Laranja
- 🟡 **Inter**: Amarelo
- ⚫ **C6 Bank**: Preto
- 🟢 **Utmify**: Verde

## 📱 Compatibilidade

- ✅ **Android** (todas as versões)
- ✅ **Chrome** (desktop e mobile)
- ✅ **Edge** (desktop e mobile)
- ✅ **Firefox** (desktop e mobile)
- ✅ **Safari** (iOS - com limitações)

## 🚀 Próximos Passos

1. **Testar** em dispositivos Android reais
2. **Ajustar** cores e estilos conforme feedback
3. **Adicionar** mais bancos se necessário
4. **Implementar** notificações push reais
5. **Integrar** com sistema de pagamentos

---

**✨ As notificações Android agora têm o mesmo estilo visual do exemplo do Nubank, mas com as logos específicas de cada banco!**

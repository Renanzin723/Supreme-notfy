# Configuração iOS para Notificações

## Problema Identificado
No iOS mais atualizado, as notificações estão aparecendo como "From Nubank" em vez de "de Nubank".

## Causa
O iOS usa o `appName` definido no `capacitor.config.ts` para determinar o remetente das notificações. O sistema iOS automaticamente adiciona "From" antes do nome do app.

## Soluções Implementadas

### 1. Configuração do Capacitor
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'app.lovable.1cb4a10d50f7471ab93c641cd47e43bd',
  appName: 'Nubank Notify', // Este nome aparece como "From Nubank Notify"
  // ...
  ios: {
    scheme: "Nubank Notify",
    contentInset: "automatic"
  }
};
```

### 2. Configuração do Manifest
```json
// public/manifest.json
{
  "name": "Nubank Notify",
  "short_name": "Nubank",
  // ...
}
```

## Soluções Adicionais Necessárias

### 1. Configurar Bundle Display Name
Para iOS, é necessário configurar o `CFBundleDisplayName` no arquivo `Info.plist` do projeto iOS:

```xml
<key>CFBundleDisplayName</key>
<string>Nubank</string>
```

### 2. Configurar Localized Display Name
Para garantir que apareça "de Nubank" em português:

```xml
<key>CFBundleLocalizations</key>
<array>
    <string>pt</string>
    <string>en</string>
</array>
```

### 3. Configurar Notification Display Name
Para notificações específicas, pode ser necessário configurar:

```xml
<key>NSUserNotificationAlertStyle</key>
<string>alert</string>
```

## Próximos Passos

1. **Gerar projeto iOS**: Execute `npx cap add ios` se ainda não foi feito
2. **Configurar Info.plist**: Editar o arquivo `ios/App/App/Info.plist`
3. **Rebuild**: Executar `npx cap sync ios`
4. **Testar**: Compilar e testar no dispositivo iOS

## Arquivos a Modificar

- `ios/App/App/Info.plist` - Configurações do app iOS
- `ios/App/App/AppDelegate.swift` - Configurações de notificação
- `capacitor.config.ts` - Configurações do Capacitor

## Comandos Necessários

```bash
# Adicionar plataforma iOS (se não existir)
npx cap add ios

# Sincronizar configurações
npx cap sync ios

# Abrir no Xcode
npx cap open ios
```

## Nota Importante
O comportamento "From [AppName]" é padrão do iOS e pode não ser totalmente customizável. A solução mais eficaz é usar um nome de app que funcione bem com "From" em inglês ou configurar localizações específicas.

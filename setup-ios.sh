#!/bin/bash

# Script para configurar iOS e corrigir problema "From Nubank"

echo "🔧 Configurando iOS para corrigir problema 'From Nubank'..."

# 1. Adicionar plataforma iOS
echo "📱 Adicionando plataforma iOS..."
npx cap add ios

# 2. Sincronizar configurações
echo "🔄 Sincronizando configurações..."
npx cap sync ios

# 3. Configurar Info.plist
echo "⚙️ Configurando Info.plist..."

# Backup do Info.plist original
cp ios/App/App/Info.plist ios/App/App/Info.plist.backup

# Adicionar configurações para corrigir "From Nubank"
cat >> ios/App/App/Info.plist << 'EOF'

<!-- Configurações para corrigir "From Nubank" -->
<key>CFBundleDisplayName</key>
<string>Nubank</string>

<key>CFBundleLocalizations</key>
<array>
    <string>pt</string>
    <string>en</string>
</array>

<key>NSUserNotificationAlertStyle</key>
<string>alert</string>

<key>CFBundleName</key>
<string>Nubank Notify</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>

<key>CFBundleVersion</key>
<string>1</string>
EOF

echo "✅ Configuração iOS concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: npx cap open ios"
echo "2. No Xcode, configure o Bundle Identifier"
echo "3. Compile e teste no dispositivo iOS"
echo ""
echo "🎯 Isso deve resolver o problema 'From Nubank' → 'de Nubank'"

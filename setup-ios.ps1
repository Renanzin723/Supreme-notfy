# Script PowerShell para configurar iOS e corrigir problema "From Nubank"

Write-Host "🔧 Configurando iOS para corrigir problema 'From Nubank'..." -ForegroundColor Cyan

# 1. Adicionar plataforma iOS
Write-Host "📱 Adicionando plataforma iOS..." -ForegroundColor Yellow
npx cap add ios

# 2. Sincronizar configurações
Write-Host "🔄 Sincronizando configurações..." -ForegroundColor Yellow
npx cap sync ios

# 3. Verificar se o diretório iOS foi criado
if (Test-Path "ios/App/App/Info.plist") {
    Write-Host "✅ Diretório iOS criado com sucesso!" -ForegroundColor Green
    
    # Backup do Info.plist original
    Copy-Item "ios/App/App/Info.plist" "ios/App/App/Info.plist.backup"
    Write-Host "📋 Backup do Info.plist criado" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "📋 Próximos passos manuais:" -ForegroundColor Cyan
    Write-Host "1. Abra o arquivo: ios/App/App/Info.plist" -ForegroundColor White
    Write-Host "2. Adicione as seguintes configurações:" -ForegroundColor White
    Write-Host ""
    Write-Host "   <key>CFBundleDisplayName</key>" -ForegroundColor Gray
    Write-Host "   <string>Nubank</string>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   <key>CFBundleLocalizations</key>" -ForegroundColor Gray
    Write-Host "   <array>" -ForegroundColor Gray
    Write-Host "       <string>pt</string>" -ForegroundColor Gray
    Write-Host "       <string>en</string>" -ForegroundColor Gray
    Write-Host "   </array>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Execute: npx cap open ios" -ForegroundColor White
    Write-Host "4. No Xcode, configure o Bundle Identifier" -ForegroundColor White
    Write-Host "5. Compile e teste no dispositivo iOS" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Isso deve resolver o problema 'From Nubank' → 'de Nubank'" -ForegroundColor Green
} else {
    Write-Host "❌ Erro: Diretório iOS não foi criado" -ForegroundColor Red
    Write-Host "Verifique se o Capacitor está instalado corretamente" -ForegroundColor Red
}

Write-Host ""
Write-Host "📖 Para mais informações, consulte: ios-config.md" -ForegroundColor Cyan

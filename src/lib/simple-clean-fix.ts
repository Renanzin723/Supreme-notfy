// SOLUÇÃO SIMPLES - Apenas limpa títulos sem interceptação
// Remove "De [Nome do Site]" de forma simples e segura

console.log('🚀 [SIMPLE CLEAN] Inicializando limpeza simples de títulos...');

// Função para limpar títulos de notificação
export function cleanNotificationTitle(title: string): string {
  if (!title) return title;
  
  let clean = title;
  
  // Remover padrões específicos do iOS PWA
  clean = clean.replace(/^De\s+Notify\s+App\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s*/i, '');
  clean = clean.replace(/^De\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+/i, '');
  clean = clean.replace(/^From\s+/i, '');
  
  // Limpar espaços extras
  clean = clean.trim();
  
  if (clean !== title) {
    console.log('🔧 [SIMPLE CLEAN] Título limpo:', { original: title, clean: clean });
  }
  
  return clean;
}

console.log('✅ [SIMPLE CLEAN] Função de limpeza disponível');

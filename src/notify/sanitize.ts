// Limpa título e aplica subtitle invisível para suprimir o "de <App>" do iOS
export function sanitizeNotificationPayload(input: any = {}) {
  const p: any = { ...(input || {}) };

  // normalizar título em 1 linha
  const rawTitle = String(p.title ?? 'Notificação');
  p.title = rawTitle
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/[\r\n]+/g, '\n')
    .split('\n')
    // elimina linhas extras do tipo "de ... / via ... / from ..."
    .filter((ln, i) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  // corpo pode ficar multiline; só tirar <br> HTML acidental
  if (typeof p.body === 'string') {
    p.body = p.body.replace(/<br\s*\/?>/gi, '\n').trim();
  }

  // 🔒 forçar subtitle invisível (zero-width space) — sobrepõe o que o iOS colocaria
  const ZWSP = '\u200B';
  p.subtitle = ZWSP;

  // limpar aliases que possam reintroduzir subtitle
  if (p.options) {
    p.options.subtitle = ZWSP;
    delete p.options.subTitle;
    delete p.options.apple_subtitle;
  }
  delete p.subTitle;
  delete p.apple_subtitle;
  delete p.from;
  delete p.appName;

  return p;
}

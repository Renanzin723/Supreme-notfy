// Remove "subtitle" e segundas linhas artificiais nos títulos/strings
export function sanitizeNotificationInput(input: any = {}) {
  const { subtitle, subTitle, apple_subtitle, from, appName, ...rest } = input || {};
  
  // impedir que subtítulos vazem por aliases
  delete (rest as any).subtitle;
  delete (rest as any).subTitle;
  delete (rest as any).apple_subtitle;
  delete (rest as any).from;
  delete (rest as any).appName;

  if (typeof rest.title === 'string') {
    rest.title = rest.title
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  if (typeof rest.body === 'string') {
    // remove ruídos comuns como "de App" no começo de linhas seguintes
    rest.body = rest.body
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  console.log('🔧 [NOTIFY-V2] Input sanitizado:', { original: input, clean: rest });
  return rest;
}

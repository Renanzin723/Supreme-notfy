# Sistema de Templates HTML

Este projeto foi configurado para não usar imports diretos de arquivos HTML, evitando problemas com `export default "/assets/xxx.html"` no build.

## ✅ O que foi configurado:

### 1. **Vite Configurado para SPA**
- `base: '/'` para funcionar corretamente na Vercel
- `outDir: 'dist'` e `assetsDir: 'assets'` definidos
- `sourcemap: false` para builds mais rápidos

### 2. **Vercel.json para SPA**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. **Script de Guard Rails**
- `npm run prebuild` executa automaticamente antes do build
- Detecta e impede imports de arquivos `.html`
- Instalado como dependência de desenvolvimento

### 4. **Sistema de Templates**
- Pasta `/public/templates/` para arquivos HTML
- Função helper `loadTemplate()` em `src/lib/template-loader.ts`

## 🚀 Como usar templates HTML:

### Opção 1: Usando a função helper
```typescript
import { loadTemplate } from '@/lib/template-loader';

// Em um componente React
const [template, setTemplate] = useState<string>('');

useEffect(() => {
  loadTemplate('/templates/preview.html')
    .then(setTemplate)
    .catch(console.error);
}, []);

// Renderizar o HTML (cuidado com XSS)
return <div dangerouslySetInnerHTML={{ __html: template }} />;
```

### Opção 2: Fetch direto
```typescript
const response = await fetch('/templates/example.html');
const htmlContent = await response.text();
```

## 📁 Estrutura de arquivos:

```
public/
  templates/           # ← Coloque seus templates HTML aqui
    example.html       # ← Exemplo
    preview.html       # ← Seus templates
    ...
src/
  lib/
    template-loader.ts # ← Função helper
```

## ⚠️ Regras importantes:

1. **NUNCA** importe arquivos `.html` diretamente:
   ```typescript
   // ❌ ERRADO
   import template from './template.html';
   
   // ✅ CORRETO
   const template = await loadTemplate('/templates/template.html');
   ```

2. **SEMPRE** coloque templates em `/public/templates/`

3. **CUIDADO** com XSS ao renderizar HTML dinâmico

## 🔧 Comandos úteis:

```bash
# Verificar se há imports HTML inválidos
npm run prebuild

# Build com verificação automática
npm run build

# Preview local
npm run preview
```

## 🚀 Deploy na Vercel:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. As rotas SPA funcionarão automaticamente com o `vercel.json`

---

**Status**: ✅ Configuração completa e testada

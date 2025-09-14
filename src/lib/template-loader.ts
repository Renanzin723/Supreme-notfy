/**
 * Utility function to load HTML templates from /public/templates/
 * Use this instead of importing HTML files directly
 */
export async function loadTemplate(templatePath: string): Promise<string> {
  try {
    const response = await fetch(templatePath, { 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error);
    throw new Error(`Falha ao carregar template: ${templatePath}`);
  }
}

/**
 * Example usage:
 * 
 * const htmlContent = await loadTemplate('/templates/preview.html');
 * 
 * // For React components:
 * const [template, setTemplate] = useState<string>('');
 * 
 * useEffect(() => {
 *   loadTemplate('/templates/example.html')
 *     .then(setTemplate)
 *     .catch(console.error);
 * }, []);
 */

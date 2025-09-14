// Inicialização do notify-v2 sem dependências circulares
import { displayLocalNotification } from './index';
import { initCompatibilityShims } from './compatibility';

// Inicializar shims de compatibilidade
initCompatibilityShims(displayLocalNotification);

console.log('🔔 [NOTIFY-V2] Inicializado com sucesso');

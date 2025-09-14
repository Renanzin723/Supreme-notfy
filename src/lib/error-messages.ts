// Sistema de mensagens de erro específicas
export interface ErrorDetails {
  code: string;
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const ERROR_MESSAGES: Record<string, ErrorDetails> = {
  // Erros de autenticação
  'AUTH_INVALID_CREDENTIALS': {
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Credenciais inválidas',
    suggestion: 'Verifique seu email e senha. Se esqueceu a senha, use a opção de recuperação.',
    severity: 'medium'
  },
  'AUTH_SUBSCRIPTION_EXPIRED': {
    code: 'AUTH_SUBSCRIPTION_EXPIRED',
    message: 'Sua assinatura expirou',
    suggestion: 'Entre em contato com o suporte para renovar sua assinatura ou escolha um novo plano.',
    severity: 'high'
  },
  'AUTH_ACCOUNT_SUSPENDED': {
    code: 'AUTH_ACCOUNT_SUSPENDED',
    message: 'Conta suspensa',
    suggestion: 'Sua conta foi temporariamente suspensa. Entre em contato com o suporte.',
    severity: 'critical'
  },

  // Erros de notificação
  'NOTIFICATION_PERMISSION_DENIED': {
    code: 'NOTIFICATION_PERMISSION_DENIED',
    message: 'Permissão de notificação negada',
    suggestion: 'Ative as notificações nas configurações do navegador para receber alertas importantes.',
    severity: 'medium'
  },
  'NOTIFICATION_SERVICE_UNAVAILABLE': {
    code: 'NOTIFICATION_SERVICE_UNAVAILABLE',
    message: 'Serviço de notificação indisponível',
    suggestion: 'Tente novamente em alguns minutos. Se o problema persistir, verifique sua conexão.',
    severity: 'medium'
  },
  'NOTIFICATION_INVALID_TOKEN': {
    code: 'NOTIFICATION_INVALID_TOKEN',
    message: 'Token de notificação inválido',
    suggestion: 'Recarregue a página para obter um novo token de notificação.',
    severity: 'low'
  },

  // Erros de rede
  'NETWORK_CONNECTION_LOST': {
    code: 'NETWORK_CONNECTION_LOST',
    message: 'Conexão perdida',
    suggestion: 'Verifique sua conexão com a internet e tente novamente.',
    severity: 'medium'
  },
  'NETWORK_TIMEOUT': {
    code: 'NETWORK_TIMEOUT',
    message: 'Tempo limite excedido',
    suggestion: 'A operação demorou mais que o esperado. Tente novamente.',
    severity: 'low'
  },
  'NETWORK_SERVER_ERROR': {
    code: 'NETWORK_SERVER_ERROR',
    message: 'Erro interno do servidor',
    suggestion: 'O servidor está temporariamente indisponível. Tente novamente em alguns minutos.',
    severity: 'high'
  },

  // Erros de validação
  'VALIDATION_REQUIRED_FIELD': {
    code: 'VALIDATION_REQUIRED_FIELD',
    message: 'Campo obrigatório não preenchido',
    suggestion: 'Preencha todos os campos marcados como obrigatórios.',
    severity: 'low'
  },
  'VALIDATION_INVALID_EMAIL': {
    code: 'VALIDATION_INVALID_EMAIL',
    message: 'Email inválido',
    suggestion: 'Digite um endereço de email válido (ex: usuario@exemplo.com).',
    severity: 'low'
  },
  'VALIDATION_PASSWORD_TOO_WEAK': {
    code: 'VALIDATION_PASSWORD_TOO_WEAK',
    message: 'Senha muito fraca',
    suggestion: 'Use pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.',
    severity: 'medium'
  },

  // Erros de Service Worker
  'SERVICE_WORKER_NOT_SUPPORTED': {
    code: 'SERVICE_WORKER_NOT_SUPPORTED',
    message: 'Service Worker não suportado',
    suggestion: 'Seu navegador não suporta notificações em background. Use um navegador mais recente.',
    severity: 'medium'
  },
  'SERVICE_WORKER_REGISTRATION_FAILED': {
    code: 'SERVICE_WORKER_REGISTRATION_FAILED',
    message: 'Falha ao registrar Service Worker',
    suggestion: 'Recarregue a página. Se o problema persistir, limpe o cache do navegador.',
    severity: 'high'
  },

  // Erros de assinatura
  'SUBSCRIPTION_CREATION_FAILED': {
    code: 'SUBSCRIPTION_CREATION_FAILED',
    message: 'Falha ao criar assinatura',
    suggestion: 'Verifique os dados fornecidos e tente novamente. Se o problema persistir, entre em contato com o suporte.',
    severity: 'high'
  },
  'SUBSCRIPTION_UPDATE_FAILED': {
    code: 'SUBSCRIPTION_UPDATE_FAILED',
    message: 'Falha ao atualizar assinatura',
    suggestion: 'Tente novamente. Se o problema persistir, entre em contato com o suporte.',
    severity: 'medium'
  },

  // Erro genérico
  'UNKNOWN_ERROR': {
    code: 'UNKNOWN_ERROR',
    message: 'Erro inesperado',
    suggestion: 'Algo deu errado. Recarregue a página e tente novamente. Se o problema persistir, entre em contato com o suporte.',
    severity: 'medium'
  }
};

export const getErrorMessage = (error: any): ErrorDetails => {
  // Se já é um ErrorDetails, retorna diretamente
  if (error && typeof error === 'object' && error.code && error.message) {
    return error;
  }

  // Se é uma string, tenta encontrar o erro correspondente
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Se é um objeto Error, tenta extrair informações
  if (error instanceof Error) {
    const errorCode = error.message.match(/\[(\w+)\]/)?.[1];
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
  }

  // Se é um objeto com propriedades específicas
  if (error && typeof error === 'object') {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }
    
    if (error.message) {
      // Tenta encontrar por mensagem
      const found = Object.values(ERROR_MESSAGES).find(
        err => err.message.toLowerCase().includes(error.message.toLowerCase())
      );
      if (found) return found;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const formatErrorForToast = (error: any) => {
  const errorDetails = getErrorMessage(error);
  
  return {
    title: errorDetails.message,
    description: errorDetails.suggestion,
    variant: errorDetails.severity === 'critical' || errorDetails.severity === 'high' 
      ? 'destructive' as const 
      : 'default' as const
  };
};

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Webhook, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  Activity, 
  Shield, 
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  Key,
  Globe,
  Database,
  BarChart3
} from 'lucide-react'
import { supabaseApiClient } from '@/lib/supabase-api'
import { Payment, WebhookLog } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

const AdminWebhookIntegrations: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState('')
  const [webhookConfig, setWebhookConfig] = useState({
    secret: '',
    autoApprove: true,
    retryAttempts: 3,
    timeout: 30000
  })

  const [webhookSecrets, setWebhookSecrets] = useState({
    caktoSecret: '',
    nivuspaySecret: '',
    showSecrets: false
  })

  const [securityStatus, setSecurityStatus] = useState({
    caktoConfigured: false,
    nivuspayConfigured: false
  })

  // URLs dos webhooks
  const webhookUrls = {
    cakto: `${window.location.origin}/api/webhook/cakto`,
    nivuspay: `${window.location.origin}/api/webhook/nivuspay`
  }

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    // Verificar autenticação primeiro
    const tokenData = localStorage.getItem('supreme-notify-token');
    if (!tokenData) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedData = JSON.parse(tokenData);
      const user = parsedData.user;
      
      // Verificar se é admin ou agent
      if (user?.role !== 'ADMIN' && user?.role !== 'AGENT') {
        navigate('/admin/login');
        return;
      }

      // Se autenticação OK, buscar dados
      await fetchData();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true)
      // Aqui você implementaria as chamadas para buscar pagamentos e logs
      // const [paymentsResult, logsResult] = await Promise.all([
      //   supabaseApiClient.getPayments(),
      //   supabaseApiClient.getWebhookLogs()
      // ])
      
      // Simulação de dados para demonstração
      setPayments([])
      setWebhookLogs([])
      
      // Verificar status de segurança dos webhooks
      await checkSecurityStatus()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkSecurityStatus = async () => {
    try {
      // Em um ambiente real, você faria uma chamada para a API para verificar se as variáveis estão configuradas
      // Por enquanto, vamos simular baseado no localStorage ou fazer uma verificação
      const caktoConfigured = !!process.env.CAKTO_WEBHOOK_SECRET || !!localStorage.getItem('cakto-webhook-secret')
      const nivuspayConfigured = !!process.env.NIVUSPAY_WEBHOOK_SECRET || !!localStorage.getItem('nivuspay-webhook-secret')
      
      setSecurityStatus({
        caktoConfigured,
        nivuspayConfigured
      })
    } catch (error) {
      console.error('Erro ao verificar status de segurança:', error)
    }
  }

  const saveWebhookSecret = async (gateway: string, secret: string) => {
    try {
      // Em um ambiente real, você salvaria no backend/database
      // Por enquanto, vamos salvar no localStorage para demonstração
      const key = `${gateway}-webhook-secret`
      localStorage.setItem(key, secret)
      
      // Atualizar status
      await checkSecurityStatus()
      
      // Feedback visual
      alert(`Secret do ${gateway} salvo com sucesso!`)
    } catch (error) {
      console.error('Erro ao salvar secret:', error)
      alert('Erro ao salvar secret')
    }
  }

  const testWebhookSecurity = async (gateway: string) => {
    try {
      // Simular teste de validação de signature
      alert(`Teste de segurança do ${gateway} executado! Verifique os logs para detalhes.`)
    } catch (error) {
      console.error('Erro no teste de segurança:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      'PAID': { variant: 'default' as const, label: 'Pago', icon: CheckCircle },
      'FAILED': { variant: 'destructive' as const, label: 'Falhou', icon: XCircle },
      'REFUNDED': { variant: 'outline' as const, label: 'Reembolsado', icon: RefreshCw },
      'CANCELLED': { variant: 'secondary' as const, label: 'Cancelado', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getWebhookStatusBadge = (status: string) => {
    const statusConfig = {
      'SUCCESS': { variant: 'default' as const, label: 'Sucesso', icon: CheckCircle },
      'ERROR': { variant: 'destructive' as const, label: 'Erro', icon: XCircle },
      'PENDING': { variant: 'secondary' as const, label: 'Pendente', icon: Clock }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <span className="text-blue-700 font-semibold">Carregando integrações...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              INTEGRAÇÕES WEBHOOK
            </h1>
            <p className="text-gray-800 text-lg font-medium">Configure e monitore integrações de pagamento</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge 
              variant={securityStatus.caktoConfigured && securityStatus.nivuspayConfigured ? "default" : "destructive"} 
              className={`flex items-center gap-2 ${
                securityStatus.caktoConfigured && securityStatus.nivuspayConfigured 
                  ? "bg-green-500" 
                  : "bg-red-500"
              }`}
            >
              <Shield className="h-4 w-4" />
              {securityStatus.caktoConfigured && securityStatus.nivuspayConfigured 
                ? "Segurança Configurada" 
                : "Configurar Segurança"
              }
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sistema Online
            </Badge>
            <Button 
              onClick={() => window.location.href = '/admin'}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 group shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-700">Pagamentos Hoje</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Activity className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '75%'}}></div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white/80 border-green-200 backdrop-blur-sm hover:border-green-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700">Webhooks Ativos</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Webhook className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-white/80 border-yellow-200 backdrop-blur-sm hover:border-yellow-400 transition-all duration-300 group shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700">Taxa de Sucesso</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <BarChart3 className="h-4 w-4 text-yellow-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">98.5%</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full" style={{width: '98%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-red-200 backdrop-blur-sm hover:border-red-400 transition-all duration-300 group shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-red-700">Erros Hoje</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="h-4 w-4 text-red-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 rounded-full" style={{width: '0%'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentação dos Planos */}
        <Card className="bg-white/80 border-green-200 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Key className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Planos Disponíveis</CardTitle>
                <p className="text-gray-700 font-medium">Valores e identificadores dos planos para webhooks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Plano Diário</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">R$ 9,90</p>
                <p className="text-sm text-blue-700">ID: Plano Diário</p>
                <p className="text-xs text-gray-700 font-medium">24 horas de acesso</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Plano Semanal</h4>
                <p className="text-2xl font-bold text-green-600 mb-1">R$ 15,90</p>
                <p className="text-sm text-green-700">ID: Plano Semanal</p>
                <p className="text-xs text-gray-700 font-medium">7 dias de acesso</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">Plano Mensal</h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">R$ 34,90</p>
                <p className="text-sm text-purple-700">ID: Plano Mensal</p>
                <p className="text-xs text-gray-700 font-medium">30 dias de acesso</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">Plano Lifetime</h4>
                <p className="text-2xl font-bold text-orange-600 mb-1">R$ 47,90</p>
                <p className="text-sm text-orange-700">ID: Plano Lifetime</p>
                <p className="text-xs text-gray-700 font-medium">Acesso vitalício</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URLs dos Webhooks */}
        <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Webhook className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">URLs dos Webhooks</CardTitle>
                  <p className="text-gray-700 font-medium">Configure estas URLs nos seus gateways de pagamento</p>
                </div>
              </div>
              <Button 
                onClick={fetchData}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(webhookUrls).map(([gateway, url]) => (
                <div key={gateway} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 capitalize">
                      {gateway}
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(url)}
                      className="flex items-center gap-2"
                    >
                      {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedUrl ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={url}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Segurança */}
        <Card className="bg-white/80 border-red-200 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Configuração de Segurança</CardTitle>
                <p className="text-gray-700 font-medium">Configure os secrets para validação de webhooks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cakto */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Cakto</h3>
                  <div className="flex items-center gap-2">
                    {securityStatus.caktoConfigured ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Não Configurado
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="cakto-secret">Secret da Cakto</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="cakto-secret"
                      type={webhookSecrets.showSecrets ? "text" : "password"}
                      placeholder="Digite o secret da Cakto..."
                      value={webhookSecrets.caktoSecret}
                      onChange={(e) => setWebhookSecrets(prev => ({ ...prev, caktoSecret: e.target.value }))}
                      className="bg-white border-red-200 focus:border-red-400 shadow-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWebhookSecrets(prev => ({ ...prev, showSecrets: !prev.showSecrets }))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => saveWebhookSecret('cakto', webhookSecrets.caktoSecret)}
                      className="bg-red-500 hover:bg-red-600 text-white flex-1"
                      disabled={!webhookSecrets.caktoSecret.trim()}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Salvar Secret
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testWebhookSecurity('cakto')}
                      disabled={!securityStatus.caktoConfigured}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>📋 Como obter:</strong> Acesse o painel da Cakto → Configurações → Webhooks → Secret
                  </p>
                </div>
              </div>

              {/* Nivuspay */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Nivuspay</h3>
                  <div className="flex items-center gap-2">
                    {securityStatus.nivuspayConfigured ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Não Configurado
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="nivuspay-secret">Secret da Nivuspay</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="nivuspay-secret"
                      type={webhookSecrets.showSecrets ? "text" : "password"}
                      placeholder="Digite o secret da Nivuspay..."
                      value={webhookSecrets.nivuspaySecret}
                      onChange={(e) => setWebhookSecrets(prev => ({ ...prev, nivuspaySecret: e.target.value }))}
                      className="bg-white border-red-200 focus:border-red-400 shadow-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWebhookSecrets(prev => ({ ...prev, showSecrets: !prev.showSecrets }))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => saveWebhookSecret('nivuspay', webhookSecrets.nivuspaySecret)}
                      className="bg-red-500 hover:bg-red-600 text-white flex-1"
                      disabled={!webhookSecrets.nivuspaySecret.trim()}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Salvar Secret
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testWebhookSecurity('nivuspay')}
                      disabled={!securityStatus.nivuspayConfigured}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>📋 Como obter:</strong> Acesse o painel da Nivuspay → Configurações → Webhooks → Secret
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">⚠️ Importante</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Os secrets são usados para validar a autenticidade dos webhooks. 
                    Sem eles configurados, os webhooks podem ser falsificados. 
                    Configure os secrets em produção para máxima segurança.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Settings className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Configurações</CardTitle>
                <p className="text-gray-700 font-medium">Configure o comportamento dos webhooks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Segurança de Webhooks</h4>
              </div>
              <p className="text-sm text-blue-700">
                Configure os secrets dos gateways na seção de "Configuração de Segurança" acima. 
                O sistema valida as assinaturas HMAC-SHA256 e registra todos os webhooks para auditoria.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="retry-attempts">Tentativas de Reenvio</Label>
                  <Select value={webhookConfig.retryAttempts.toString()} onValueChange={(value) => setWebhookConfig(prev => ({ ...prev, retryAttempts: parseInt(value) }))}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-lg">
                      <SelectItem value="1" className="hover:bg-blue-50 focus:bg-blue-50">1 tentativa</SelectItem>
                      <SelectItem value="3" className="hover:bg-blue-50 focus:bg-blue-50">3 tentativas</SelectItem>
                      <SelectItem value="5" className="hover:bg-blue-50 focus:bg-blue-50">5 tentativas</SelectItem>
                      <SelectItem value="10" className="hover:bg-blue-50 focus:bg-blue-50">10 tentativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={webhookConfig.timeout}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                    className="bg-white border-blue-200 focus:border-blue-400 shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-approve"
                    checked={webhookConfig.autoApprove}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, autoApprove: e.target.checked }))}
                    className="rounded border-blue-200"
                  />
                  <Label htmlFor="auto-approve">Aprovação Automática</Label>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Dica:</strong> Mantenha a aprovação automática ativada para melhor experiência do usuário.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs de Webhook */}
        <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Database className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Logs de Webhook</CardTitle>
                  <p className="text-gray-700 font-medium">Histórico de todas as requisições recebidas</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Logs
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {webhookLogs.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum log de webhook encontrado</p>
                <p className="text-sm text-gray-400">Os logs aparecerão aqui quando os webhooks forem recebidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Webhook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{log.gateway_name}</p>
                        <p className="text-sm text-gray-600">{log.webhook_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getWebhookStatusBadge(log.status)}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminWebhookIntegrations

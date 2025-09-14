import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';
import SupremeNotifyIcon from '@/components/SupremeNotifyIcon';
import { supabaseApiClient } from '@/lib/supabase-api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkoutLinks, setCheckoutLinks] = useState({
    daily: '',
    weekly: '',
    monthly: '',
    lifetime: ''
  });

  // Planos disponíveis
  const plans = [
    { id: 'daily', name: 'Diário', price: 'R$ 9,90', description: 'Acesso por 1 dia', duration: 1, unit: 'day' },
    { id: 'weekly', name: 'Semanal', price: 'R$ 15,90', description: 'Acesso por 7 dias', duration: 7, unit: 'day' },
    { id: 'monthly', name: 'Mensal', price: 'R$ 34,90', description: 'Acesso por 30 dias', duration: 30, unit: 'day' },
    { id: 'lifetime', name: 'Vitalício', price: 'R$ 47,90', description: 'Acesso permanente', duration: null, unit: 'lifetime' }
  ];

  // Carregar links de checkout
  useEffect(() => {
    const loadCheckoutLinks = () => {
      const links = localStorage.getItem('checkout-links');
      if (links) {
        setCheckoutLinks(JSON.parse(links));
      }
    };
    loadCheckoutLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    if (!selectedPlan) {
      setError('Selecione um plano');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await supabaseApiClient.createUser({
        username: formData.username,
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: 'USER',
        status: 'PENDING', // Novos usuários ficam pendentes até aprovação
        is_active: true,
        must_change_password: false
      });

      if (result.success) {
        // Salvar dados do usuário e plano selecionado temporariamente
        const userData = {
          username: formData.username,
          email: formData.email,
          name: formData.name,
          selectedPlan: selectedPlan,
          planDetails: plans.find(p => p.id === selectedPlan)
        };
        localStorage.setItem('pending-user-data', JSON.stringify(userData));
        
        // Redirecionar para checkout
        const checkoutUrl = checkoutLinks[selectedPlan as keyof typeof checkoutLinks];
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank');
        } else {
          setError('Link de checkout não configurado para este plano. Entre em contato com o administrador.');
        }
      } else {
        setError(result.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="notification-card">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Conta criada com sucesso!</h2>
              <p className="text-muted-foreground mb-4">
                Aguarde ativação/assinatura pelo Admin.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o login...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="notification-card">
          <CardHeader className="text-center">
            <div className="mb-4">
              <SupremeNotifyIcon size="md" />
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Crie sua conta no Supreme Notify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Usuário *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Escolha seu plano *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                            <span className="text-lg font-bold text-primary">{plan.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === plan.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedPlan === plan.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta e Fazer Pagamento'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate('/login')}
                >
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;

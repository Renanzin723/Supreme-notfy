# 🔐 Sistema de Admin - Supreme Notify

Sistema completo de administração com autenticação JWT, gerenciamento de usuários e assinaturas.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação e Autorização
- **Login/Signup**: Páginas públicas para autenticação
- **JWT**: Tokens seguros com expiração de 7 dias
- **Roles**: USER, ADMIN, AGENT, VIEWER
- **Middleware**: Proteção de rotas e APIs
- **Cookies**: httpOnly e secure para produção

### ✅ Painel Administrativo
- **Dashboard**: KPIs e métricas em tempo real
- **Usuários**: CRUD completo com filtros e paginação
- **Assinaturas**: Gerenciamento de planos e status
- **Métricas**: Usuários ativos, MRR, churn, trials

### ✅ APIs RESTful
- **Auth**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **License**: `/api/license/status` para verificar assinaturas
- **Admin**: `/api/admin/users`, `/api/admin/subscriptions`
- **Metrics**: `/api/admin/metrics/summary`

## 🛠️ Stack Técnica

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM + MySQL/SQLite
- **Auth**: JWT + bcrypt
- **Timezone**: America/Sao_Paulo

## 📋 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
```bash
# Copiar arquivo de ambiente
cp env.example .env

# Editar .env com suas configurações
DATABASE_URL="mysql://username:password@localhost:3306/supremenotify"
JWT_SECRET="seu_jwt_secret_super_seguro"
NEXT_PUBLIC_APP_NAME="SupremeNotify"
```

### 3. Configurar Prisma
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Executar seed (cria usuário admin)
npm run prisma:seed
```

### 4. Executar Aplicação
```bash
npm run dev
```

## 👤 Usuário Admin Padrão

Após executar o seed, você terá acesso com:

- **Username**: `renan7rlk`
- **Password**: `Bet220412$`
- **Role**: `ADMIN`

## 🎯 Rotas Disponíveis

### Públicas
- `/login` - Login de usuários
- `/signup` - Criação de conta
- `/admin/login` - Login de administradores

### Protegidas (Admin)
- `/admin` - Dashboard principal
- `/admin/users` - Gerenciar usuários
- `/admin/subscriptions` - Gerenciar assinaturas

### APIs
- `POST /api/auth/login` - Autenticação
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário
- `GET /api/license/status` - Status da licença
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `GET /api/admin/subscriptions` - Listar assinaturas
- `POST /api/admin/subscriptions` - Criar assinatura

## 🔒 Segurança

- **JWT**: Tokens com expiração de 7 dias
- **bcrypt**: Hash de senhas com salt rounds 12
- **Cookies**: httpOnly, secure, SameSite=Lax
- **Validação**: Sanitização de inputs
- **Rate Limiting**: Proteção contra spam

## 📊 Métricas Disponíveis

- **Usuários Ativos**: Total de usuários ativos
- **Assinaturas Ativas**: Total de assinaturas válidas
- **MRR**: Receita recorrente mensal (placeholder)
- **Novos Usuários**: 7d e 30d
- **Churn**: Cancelamentos em 30d
- **Trials**: Assinaturas em período de teste
- **Past Due**: Assinaturas em atraso
- **Expirando**: Assinaturas que expiram em ≤7 dias

## 🎨 Interface

- **Design**: Mobile-first responsivo
- **Tema**: Claro/escuro automático
- **Componentes**: shadcn/ui customizados
- **Animações**: Transições suaves
- **Feedback**: Toasters e alertas

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
src/
├── pages/
│   ├── api/           # APIs REST
│   ├── admin/         # Páginas do admin
│   ├── Login.tsx      # Login público
│   └── Signup.tsx     # Signup público
├── lib/
│   ├── prisma.ts      # Cliente Prisma
│   ├── auth.ts        # Funções de auth
│   └── middleware.ts  # Middleware de proteção
├── hooks/
│   └── useAuth.ts     # Hook de autenticação
└── components/ui/     # Componentes shadcn/ui
```

### Scripts Disponíveis
```bash
npm run dev              # Desenvolvimento
npm run build            # Build produção
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações
npm run prisma:seed      # Executar seed
npm run prisma:studio    # Interface visual do banco
```

## 🚀 Deploy

### Variáveis de Ambiente (Produção)
```env
DATABASE_URL="mysql://user:pass@host:port/db"
JWT_SECRET="jwt_secret_super_seguro_producao"
NEXT_PUBLIC_APP_NAME="SupremeNotify"
NODE_ENV="production"
```

### Build para Produção
```bash
npm run build
npm run preview
```

## 📝 Próximas Implementações

- [ ] Sistema de templates de notificação
- [ ] Analytics avançados com gráficos
- [ ] Agendamento de notificações
- [ ] Integração com Firebase FCM real
- [ ] Sistema de webhooks
- [ ] Auditoria de ações
- [ ] Backup automático
- [ ] Monitoramento de performance

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para Supreme Notify**

# 🚀 Instalação do Sistema Admin - Supreme Notify

## ⚡ Instalação Rápida

```bash
# 1. Clone o repositório (se ainda não fez)
git clone <seu-repositorio>
cd supremenotify-main

# 2. Execute o setup automático
npm run setup

# 3. Inicie a aplicação
npm run dev
```

## 📋 Instalação Manual

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com suas configurações
# Para desenvolvimento, pode usar SQLite (já configurado)
```

### 3. Configurar Banco de Dados
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

## 🔑 Acesso Inicial

Após a instalação, você terá acesso com:

- **URL**: http://localhost:8080
- **Admin Login**: http://localhost:8080/admin/login
- **Username**: `renan7rlk`
- **Password**: `Bet220412$`

## 🎯 Funcionalidades Disponíveis

### Para Usuários
- ✅ Login/Signup em `/login` e `/signup`
- ✅ Dashboard de notificações em `/app`
- ✅ Verificação de licença automática

### Para Administradores
- ✅ Dashboard admin em `/admin`
- ✅ Gerenciar usuários em `/admin/users`
- ✅ Gerenciar assinaturas em `/admin/subscriptions`
- ✅ Métricas e KPIs em tempo real

## 🗄️ Banco de Dados

### Desenvolvimento (SQLite)
- **Arquivo**: `prisma/dev.db`
- **Interface**: `npx prisma studio`
- **Configuração**: Automática via setup

### Produção (MySQL)
- **Configuração**: Editar `.env`
- **URL**: `DATABASE_URL="mysql://user:pass@host:port/db"`
- **Migrações**: `npm run prisma:migrate`

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Iniciar servidor
npm run build              # Build produção
npm run preview            # Preview build

# Banco de Dados
npm run prisma:generate    # Gerar cliente
npm run prisma:migrate     # Executar migrações
npm run prisma:seed        # Executar seed
npm run prisma:studio      # Interface visual

# Setup
npm run setup              # Setup automático
```

## 🐛 Solução de Problemas

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de Banco de Dados
```bash
# Resetar banco (desenvolvimento)
rm prisma/dev.db
npm run prisma:migrate
npm run prisma:seed
```

### Erro de Prisma
```bash
# Regenerar cliente
npm run prisma:generate
```

## 📱 Testando o Sistema

### 1. Teste de Login Admin
1. Acesse http://localhost:8080/admin/login
2. Use: `renan7rlk` / `Bet220412$`
3. Verifique dashboard com métricas

### 2. Teste de Criação de Usuário
1. No admin, vá em "Usuários"
2. Clique em "Criar Usuário"
3. Preencha os dados
4. Verifique se aparece na lista

### 3. Teste de Assinatura
1. No admin, vá em "Assinaturas"
2. Clique em "Criar Assinatura"
3. Selecione um usuário
4. Configure datas e plano
5. Verifique se aparece na lista

### 4. Teste de Login Usuário
1. Acesse http://localhost:8080/login
2. Use as credenciais do usuário criado
3. Verifique se acessa o dashboard

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

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console
2. Confirme se todas as dependências estão instaladas
3. Verifique se o banco de dados está configurado
4. Execute `npm run setup` novamente

## 🎉 Pronto!

Seu sistema de admin está funcionando! 

- **Admin**: http://localhost:8080/admin
- **Login**: http://localhost:8080/login
- **App**: http://localhost:8080/app

---

**Desenvolvido com ❤️ para Supreme Notify**

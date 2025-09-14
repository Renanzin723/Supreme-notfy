#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando Supreme Notify Admin System...\n');

// Verificar se .env existe
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Arquivo .env criado! Edite com suas configurações.\n');
} else {
  console.log('✅ Arquivo .env já existe.\n');
}

// Verificar se node_modules existe
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Instalando dependências...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas!\n');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependências já instaladas.\n');
}

// Configurar Prisma para desenvolvimento (SQLite)
console.log('🗄️ Configurando banco de dados para desenvolvimento...');
try {
  // Copiar schema-dev para schema.prisma se não existir DATABASE_URL
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('DATABASE_URL=') || envContent.includes('DATABASE_URL=""')) {
    console.log('📋 Usando SQLite para desenvolvimento...');
    fs.copyFileSync(
      path.join(process.cwd(), 'prisma', 'schema-dev.prisma'),
      path.join(process.cwd(), 'prisma', 'schema.prisma')
    );
    
    // Atualizar .env com SQLite
    const updatedEnv = envContent.replace(
      'DATABASE_URL="mysql://username:password@localhost:3306/supremenotify"',
      'DATABASE_URL="file:./dev.db"'
    );
    fs.writeFileSync(envPath, updatedEnv);
    console.log('✅ Configurado para usar SQLite (dev.db)\n');
  }
} catch (error) {
  console.error('❌ Erro ao configurar banco:', error.message);
}

// Executar Prisma
console.log('🔧 Executando Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado!\n');
  
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Migrações executadas!\n');
  
  execSync('npm run prisma:seed', { stdio: 'inherit' });
  console.log('✅ Seed executado! Usuário admin criado.\n');
} catch (error) {
  console.error('❌ Erro ao executar Prisma:', error.message);
  console.log('💡 Execute manualmente: npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed\n');
}

console.log('🎉 Configuração concluída!\n');
console.log('📋 Próximos passos:');
console.log('1. Edite o arquivo .env com suas configurações');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:8080');
console.log('4. Login admin: renan7rlk / Bet220412$');
console.log('5. Acesse o admin em: http://localhost:8080/admin/login\n');
console.log('🔗 Links úteis:');
console.log('- Login: http://localhost:8080/login');
console.log('- Signup: http://localhost:8080/signup');
console.log('- Admin: http://localhost:8080/admin/login');
console.log('- Dashboard: http://localhost:8080/admin');
console.log('- Prisma Studio: npx prisma studio\n');

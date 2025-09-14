import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verificar se o usuário admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'renan7rlk' }
  });

  if (existingAdmin) {
    console.log('✅ Usuário admin já existe, pulando criação...');
    return;
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash('Bet220412$', 12);

  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      username: 'renan7rlk',
      email: 'admin@supremenotify.com',
      name: 'Administrador',
      passwordHash,
      role: 'ADMIN',
      mustChangePassword: false,
      isActive: true
    }
  });

  console.log('✅ Usuário admin criado:', {
    id: admin.id,
    username: admin.username,
    role: admin.role
  });

  // Criar assinatura padrão para o admin
  const subscription = await prisma.subscription.create({
    data: {
      userId: admin.id,
      status: 'ACTIVE',
      plan: 'admin',
      startedAt: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      cancelAtPeriodEnd: false
    }
  });

  console.log('✅ Assinatura admin criada:', {
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status
  });

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

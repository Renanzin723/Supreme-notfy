import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Middleware de autenticação para admin
function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !['ADMIN', 'AGENT'].includes(payload.role)) {
    res.status(403).json({ error: 'Acesso negado' });
    return null;
  }

  return payload;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Usuários ativos
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });

    // Assinaturas ativas
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { gte: now }
      }
    });

    // Novos usuários (7 dias)
    const newUsers7d = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Novos usuários (30 dias)
    const newUsers30d = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Assinaturas que expiram em ≤ 7 dias
    const expiringIn7Days = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Trials
    const trials = await prisma.subscription.count({
      where: { status: 'TRIALING' }
    });

    // Past Due
    const pastDue = await prisma.subscription.count({
      where: { status: 'PAST_DUE' }
    });

    // Churn (30 dias) - assinaturas canceladas
    const churn30d = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        canceledAt: { gte: thirtyDaysAgo }
      }
    });

    // MRR estimado (placeholder - seria calculado com preços reais)
    const mrr = 'N/A'; // Placeholder

    return res.status(200).json({
      activeUsers,
      activeSubscriptions,
      mrr,
      newUsers7d,
      newUsers30d,
      churn30d,
      trials,
      pastDue,
      expiringIn7Days
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

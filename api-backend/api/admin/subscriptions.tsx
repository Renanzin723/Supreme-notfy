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

  try {
    if (req.method === 'GET') {
      // Listar assinaturas com filtros
      const { status, plan, expiringInDays, page = '1', pageSize = '10' } = req.query;
      
      const pageNum = parseInt(page as string);
      const pageSizeNum = parseInt(pageSize as string);
      const skip = (pageNum - 1) * pageSizeNum;

      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (plan) {
        where.plan = plan;
      }

      if (expiringInDays) {
        const days = parseInt(expiringInDays as string);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        where.currentPeriodEnd = {
          lte: futureDate,
          gte: new Date()
        };
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          skip,
          take: pageSizeNum,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.subscription.count({ where })
      ]);

      const now = new Date();
      const subscriptionsWithRemainingDays = subscriptions.map(sub => {
        const remainingDays = Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          id: sub.id,
          userId: sub.userId,
          user: sub.user,
          status: sub.status,
          plan: sub.plan,
          startedAt: sub.startedAt,
          currentPeriodEnd: sub.currentPeriodEnd,
          remainingDays,
          canceledAt: sub.canceledAt,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          createdAt: sub.createdAt
        };
      });

      return res.status(200).json({
        subscriptions: subscriptionsWithRemainingDays,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          totalPages: Math.ceil(total / pageSizeNum)
        }
      });
    }

    if (req.method === 'POST') {
      // Criar assinatura (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem criar assinaturas' });
      }

      const { userId, plan, startedAt, currentPeriodEnd, status = 'ACTIVE', cancelAtPeriodEnd = false } = req.body;

      if (!userId || !plan || !startedAt || !currentPeriodEnd) {
        return res.status(400).json({ error: 'userId, plan, startedAt e currentPeriodEnd são obrigatórios' });
      }

      // Verificar se usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          plan,
          status,
          startedAt: new Date(startedAt),
          currentPeriodEnd: new Date(currentPeriodEnd),
          cancelAtPeriodEnd
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json(subscription);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de assinaturas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

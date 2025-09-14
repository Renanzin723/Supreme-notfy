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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da assinatura é obrigatório' });
  }

  try {
    if (req.method === 'PATCH') {
      // Atualizar assinatura (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem editar assinaturas' });
      }

      const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = req.body;

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          ...(plan !== undefined && { plan }),
          ...(status !== undefined && { status }),
          ...(currentPeriodEnd !== undefined && { currentPeriodEnd: new Date(currentPeriodEnd) }),
          ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd })
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

      return res.status(200).json(updatedSubscription);
    }

    if (req.method === 'POST' && req.url.includes('/cancel')) {
      // Cancelar assinatura (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem cancelar assinaturas' });
      }

      const { cancelAtPeriodEnd = true } = req.body;

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          cancelAtPeriodEnd,
          ...(cancelAtPeriodEnd ? {} : { 
            status: 'CANCELED',
            canceledAt: new Date()
          })
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

      return res.status(200).json(updatedSubscription);
    }

    if (req.method === 'POST' && req.url.includes('/reactivate')) {
      // Reativar assinatura (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem reativar assinaturas' });
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
          canceledAt: null
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

      return res.status(200).json(updatedSubscription);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de assinatura:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

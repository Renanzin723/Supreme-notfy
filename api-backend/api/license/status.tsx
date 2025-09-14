import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar assinatura mais recente do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: payload.sub,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const active = subscription && 
      subscription.status === 'ACTIVE' && 
      subscription.currentPeriodEnd >= now;

    const remainingDays = subscription 
      ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return res.status(200).json({
      active,
      plan: subscription?.plan || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      remainingDays,
      status: subscription?.status || null
    });
  } catch (error) {
    console.error('Erro ao verificar status da licença:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

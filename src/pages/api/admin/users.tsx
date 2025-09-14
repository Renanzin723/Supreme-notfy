import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

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
      // Listar usuários com filtros
      const { q, role, page = '1', pageSize = '10' } = req.query;
      
      const pageNum = parseInt(page as string);
      const pageSizeNum = parseInt(pageSize as string);
      const skip = (pageNum - 1) * pageSizeNum;

      const where: any = {};
      
      if (q) {
        where.OR = [
          { username: { contains: q as string } },
          { email: { contains: q as string } },
          { name: { contains: q as string } }
        ];
      }
      
      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: pageSizeNum,
          orderBy: { createdAt: 'desc' },
          include: {
            subscriptions: {
              where: {
                status: 'ACTIVE',
                currentPeriodEnd: { gte: new Date() }
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      return res.status(200).json({
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          mustChangePassword: user.mustChangePassword,
          createdAt: user.createdAt,
          activeSubscriptions: user.subscriptions.length
        })),
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          totalPages: Math.ceil(total / pageSizeNum)
        }
      });
    }

    if (req.method === 'POST') {
      // Criar usuário (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem criar usuários' });
      }

      const { username, email, name, password } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username é obrigatório' });
      }

      // Verificar se username já existe
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username já existe' });
      }

      // Verificar se email já existe (se fornecido)
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (existingEmail) {
          return res.status(400).json({ error: 'Email já existe' });
        }
      }

      const passwordToUse = password || 'senha123';
      const passwordHash = await hashPassword(passwordToUse);

      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          name,
          passwordHash,
          role: 'USER',
          mustChangePassword: !password, // true se senha padrão
          isActive: true
        }
      });

      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        mustChangePassword: newUser.mustChangePassword
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

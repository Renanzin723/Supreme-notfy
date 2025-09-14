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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  try {
    if (req.method === 'PATCH') {
      // Atualizar usuário (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem editar usuários' });
      }

      const { name, role, isActive } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(isActive !== undefined && { isActive })
        }
      });

      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      });
    }

    if (req.method === 'POST' && req.url.includes('/reset-password')) {
      // Resetar senha (apenas ADMIN)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem resetar senhas' });
      }

      const { password } = req.body;
      const passwordToUse = password || 'senha123';
      const passwordHash = await hashPassword(passwordToUse);

      await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          mustChangePassword: true
        }
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

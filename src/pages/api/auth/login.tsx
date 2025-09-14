// API Route para login
import { authenticateUser, generateToken } from '@/lib/auth';
import { setAuthToken } from '@/lib/cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identificador e senha são obrigatórios' });
    }

    const user = await authenticateUser(identifier, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken({
      sub: user.id,
      role: user.role,
      username: user.username
    });

    // Definir cookie httpOnly
    res.setHeader('Set-Cookie', `supreme-notify-token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

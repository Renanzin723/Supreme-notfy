import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Limpar cookie
  res.setHeader('Set-Cookie', 'supreme-notify-token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');

  return res.status(200).json({ success: true });
}

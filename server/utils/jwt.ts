import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, isAdmin: boolean = false): string => {
  return jwt.sign(
    { id: userId, isAdmin },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

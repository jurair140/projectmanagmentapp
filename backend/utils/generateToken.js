const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'taskflow_token';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

const isProductionEnv = () =>
  process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const getCookieOptions = () => {
  const isProd = isProductionEnv();
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

const attachTokenCookie = (res, userId) => {
  const token = generateToken(userId);
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return token;
};

const clearTokenCookie = (res) => {
  const isProd = isProductionEnv();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = {
  COOKIE_NAME,
  generateToken,
  getCookieOptions,
  attachTokenCookie,
  clearTokenCookie,
};

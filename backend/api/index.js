const connectDB = require('../config/db');
const app = require('../app');

/**
 * Vercel Serverless Function entrypoint.
 * Handles preflight OPTIONS immediately and ensures MongoDB is connected for API requests.
 */
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Database connection error:', err.message);
    const origin = req.headers.origin;
    const allowed = (process.env.CLIENT_URL || '')
      .split(',')
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    if (origin && allowed.includes(origin.replace(/\/+$/, ''))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
};

const connectDB = require('../config/db');
const app = require('../app');

/**
 * Vercel Serverless Function entrypoint.
 * Ensures MongoDB is connected before handing the request to Express.
 */
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Database connection error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
};

// Vercel serverless function entry point
const { createApp } = require('../dist/app');

module.exports = async (req, res) => {
  try {
    const app = await createApp();
    
    // Handle the request using Express
    app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

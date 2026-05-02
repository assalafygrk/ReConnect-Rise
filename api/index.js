const app = require('../server/index');

module.exports = async (req, res) => {
    try {
        // Express app is a function that can handle (req, res)
        return app(req, res);
    } catch (error) {
        console.error('VERCEL_BRIDGE_ERROR:', error);
        res.status(500).json({
            message: 'Serverless Function Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};

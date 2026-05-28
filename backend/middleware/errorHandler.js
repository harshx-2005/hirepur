const errorHandler = (err, req, res, next) => {
    console.error('💥 Error Intercepted:', err.stack || err.message || err);

    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;

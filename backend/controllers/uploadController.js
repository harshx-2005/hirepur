const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        try {
            // Attempt to upload to Cloudinary (timeout set to 8000ms for safety)
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'hirepur',
                resource_type: 'auto',
                timeout: 8000
            });

            // Remove file from local temp storage on successful Cloudinary upload
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(200).json({
                success: true,
                url: result.secure_url,
                public_id: result.public_id
            });
        } catch (cloudinaryError) {
            console.warn('⚠️ Cloudinary connection timed out. Falling back to local disk storage:', cloudinaryError.message);
            
            // Construct secure local static URL
            const localUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            
            return res.status(200).json({
                success: true,
                url: localUrl,
                isLocalFallback: true
            });
        }
    } catch (error) {
        console.error('❌ Upload Controller Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
};

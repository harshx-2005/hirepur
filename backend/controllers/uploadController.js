const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        try {
            // Upload to Cloudinary with generous timeout for large PDFs
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'hirepur',
                resource_type: 'auto',
                timeout: 15000
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
            console.error('❌ Cloudinary upload failed:', cloudinaryError.message);

            // Clean up the temp file
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(502).json({
                success: false,
                message: 'File upload to cloud storage failed. Please try again.'
            });
        }
    } catch (error) {
        console.error('❌ Upload Controller Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
};

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Strict File Filters
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    // 1. Resume validation rules
    if (file.fieldname === 'resume' || file.originalname.match(/\.(pdf|doc|docx)$/i)) {
        const allowedMimeTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimeTypes.includes(mime) || ['.pdf', '.doc', '.docx'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid resume document format. Only PDF, DOC, and DOCX files are allowed.'), false);
        }
    } 
    // 2. Images & logos validation rules
    else if (file.fieldname === 'avatar' || file.fieldname === 'logo' || file.fieldname === 'file' || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(mime) || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image file format. Only JPG, JPEG, PNG, and WEBP formats are allowed.'), false);
        }
    } 
    else {
        cb(new Error('Unsupported file category upload attempted.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        // We set general limit to 5MB, and filter triggers error if logo is over 2MB
        fileSize: 5 * 1024 * 1024 
    }
});

// Wrap multer execution to catch size limits and filter exceptions and output clear errors
const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size too large. Maximum allowed size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

router.post('/', protect, uploadMiddleware, uploadFile);

module.exports = router;

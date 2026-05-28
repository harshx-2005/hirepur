const { z } = require('zod');

// Strong Password Validation Rules
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Common Schemas
const schemas = {
    register: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address format'),
        password: passwordSchema,
        role: z.enum(['job_seeker', 'employer']),
        company_name: z.string().optional(),
        company_website: z.string().url('Invalid company website URL').optional().or(z.literal('')),
        company_size: z.string().optional(),
        industry: z.string().optional(),
        company_description: z.string().optional(),
        location: z.string().optional(),
    }).refine(data => {
        if (data.role === 'employer' && !data.company_name) {
            return false;
        }
        return true;
    }, {
        message: 'Company name is required for employer registration',
        path: ['company_name']
    }),

    login: z.object({
        email: z.string().email('Invalid email address format'),
        password: z.string().min(1, 'Password is required')
    }),

    forgotPassword: z.object({
        email: z.string().email('Invalid email address format')
    }),

    resetPassword: z.object({
        email: z.string().email('Invalid email address format'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits'),
        newPassword: passwordSchema
    }),

    verifyOtp: z.object({
        email: z.string().email('Invalid email address format'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits'),
        type: z.enum(['registration', 'forgot_password', 'secure_login'])
    }),

    resendOtp: z.object({
        email: z.string().email('Invalid email address format'),
        type: z.enum(['registration', 'forgot_password', 'secure_login'])
    })
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({ success: false, message: `Schema '${schemaName}' is not defined.` });
        }

        const result = schema.safeParse(req.body);
        if (!result.success) {
            const formattedErrors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors
            });
        }

        req.body = result.data; // Keep validated & parsed data
        next();
    };
};

module.exports = { validate, schemas };

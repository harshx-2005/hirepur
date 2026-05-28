const puppeteer = require('puppeteer');

exports.generateResumePDF = async (req, res) => {
    try {
        const { htmlContent } = req.body;
        if (!htmlContent) {
            return res.status(400).json({ success: false, message: 'HTML content is required' });
        }

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Wrap the content in basic resume styling
        const styledHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #1f2937; line-height: 1.5; font-size: 13px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #111827; font-size: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
                    h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; margin-top: 20px; margin-bottom: 8px; padding-bottom: 3px; font-size: 16px; font-weight: 800; text-transform: uppercase; }
                    h3 { font-size: 14px; margin-bottom: 4px; color: #111827; }
                    ul { padding-left: 18px; margin-top: 5px; }
                    li { margin-bottom: 4px; }
                    strong { color: #111; font-weight: 700; }
                    .contact-info { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; font-size: 11px; color: #4b5563; }
                    .contact-info div { margin-right: 15px; }
                    p { margin: 4px 0; }
                    a { color: #2563eb; text-decoration: none; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'attachment; filename=resume.pdf'
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
};

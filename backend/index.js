const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument, degrees, rgb } = require('pdf-lib');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Setup storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// PDF Merge Endpoint
app.post('/api/merge', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        const mergedPdf = await PDFDocument.create();
        for (const file of req.files) {
            const pdf = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        const mergedPdfBytes = await mergedPdf.save();
        const fileName = `merged-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, mergedPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            // Clean up the file after download
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error merging PDFs:', error);
        res.status(500).send('An error occurred while merging the PDFs.');
    }
});


// PDF Split Endpoint
app.post('/api/split', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { ranges } = req.body;
        if (!ranges) {
            return res.status(400).send('No page ranges provided.');
        }

        const originalPdf = await PDFDocument.load(req.file.buffer);
        const pageIndices = parsePageRanges(ranges, originalPdf.getPageCount());

        if (pageIndices.length === 0) {
            return res.status(400).send('Invalid page ranges provided.');
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const newPdfBytes = await newPdf.save();
        const fileName = `split-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, newPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error splitting PDF:', error);
        res.status(500).send('An error occurred while splitting the PDF.');
    }
});

// PDF Rotate Endpoint
app.post('/api/rotate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { angle } = req.body;
        if (!angle) {
            return res.status(400).send('No rotation angle provided.');
        }

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPages();

        const rotationAngle = parseInt(angle, 10);
        let newRotation;

        for (const page of pages) {
            const currentRotation = page.getRotation().angle;
            newRotation = (currentRotation + rotationAngle) % 360;
            page.setRotation(degrees(newRotation));
        }

        const rotatedPdfBytes = await pdfDoc.save();
        const fileName = `rotated-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, rotatedPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error rotating PDF:', error);
        res.status(500).send('An error occurred while rotating the PDF.');
    }
});

// PDF Protect Endpoint
app.post('/api/protect', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).send('No password provided.');
        }

        const pdfDoc = await PDFDocument.load(req.file.buffer);

        const protectedPdfBytes = await pdfDoc.save({
            encryption: {
                fullCopy: true,
                ownerPassword: password,
                userPassword: password,
            },
        });

        const fileName = `protected-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, protectedPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error protecting PDF:', error);
        res.status(500).send('An error occurred while protecting the PDF.');
    }
});

// PDF Unlock Endpoint
app.post('/api/unlock', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { password } = req.body;
        let pdfDoc;

        try {
            if (password) {
                pdfDoc = await PDFDocument.load(req.file.buffer, { password });
            } else {
                pdfDoc = await PDFDocument.load(req.file.buffer);
            }
        } catch (e) {
            return res.status(401).send('Failed to unlock PDF. Incorrect password or file is not encrypted.');
        }

        // Save without encryption to unlock
        const unlockedPdfBytes = await pdfDoc.save();

        const fileName = `unlocked-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, unlockedPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error unlocking PDF:', error);
        res.status(500).send('An error occurred while unlocking the PDF.');
    }
});

// PDF Watermark Endpoint
app.post('/api/watermark', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).send('No watermark text provided.');
        }

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPages();

        const font = await pdfDoc.embedFont('Helvetica-Bold');
        const fontSize = 50;
        const opacity = 0.3;

        for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawText(text, {
                x: width / 2 - font.widthOfTextAtSize(text, fontSize) / 2,
                y: height / 2 - fontSize / 2,
                font,
                size: fontSize,
                opacity,
                color: rgb(0.5, 0.5, 0.5), // Grey color
            });
        }

        const watermarkedPdfBytes = await pdfDoc.save();
        const fileName = `watermarked-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, watermarkedPdfBytes);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error adding watermark:', error);
        res.status(500).send('An error occurred while adding the watermark.');
    }
});

// PDF Compress Endpoint
app.post('/api/compress', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputFilePath = path.join(uploadsDir, `input-${Date.now()}.pdf`);
    const outputFileName = `compressed-${Date.now()}.pdf`;
    const outputFilePath = path.join(uploadsDir, outputFileName);

    try {
        fs.writeFileSync(inputFilePath, req.file.buffer);

        const gs = spawn('gs', [
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/ebook', // Can be /screen, /ebook, /printer, /prepress, /default
            '-dNOPAUSE',
            '-dBATCH',
            '-sOutputFile=' + outputFilePath,
            inputFilePath,
        ]);

        gs.stderr.on('data', (data) => {
            console.error(`Ghostscript stderr: ${data}`);
        });

        gs.on('close', (code) => {
            if (code === 0) {
                res.download(outputFilePath, outputFileName, (err) => {
                    if (err) console.error('Error downloading compressed file:', err);
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(outputFilePath);
                });
            } else {
                console.error(`Ghostscript process exited with code ${code}`);
                res.status(500).send('PDF compression failed.');
                fs.unlinkSync(inputFilePath);
                if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
            }
        });

    } catch (error) {
        console.error('Error during PDF compression setup:', error);
        res.status(500).send('An error occurred during PDF compression.');
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    }
});

// Office Conversion Endpoint
app.post('/api/convert-office', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { outputFormat } = req.body;
    if (!outputFormat) {
        return res.status(400).send('No output format specified.');
    }

    const inputFileName = req.file.originalname;
    const inputFileExtension = path.extname(inputFileName);
    const inputBaseName = path.basename(inputFileName, inputFileExtension);

    const inputFilePath = path.join(uploadsDir, inputFileName);
    const outputFileName = `${inputBaseName}.${outputFormat}`;
    const outputFilePath = path.join(uploadsDir, outputFileName);

    try {
        fs.writeFileSync(inputFilePath, req.file.buffer);

        const soffice = spawn('soffice', [
            '--headless',
            '--convert-to',
            outputFormat,
            inputFilePath,
            '--outdir',
            uploadsDir,
        ]);

        soffice.stderr.on('data', (data) => {
            console.error(`LibreOffice stderr: ${data}`);
        });

        soffice.on('close', (code) => {
            if (code === 0) {
                res.download(outputFilePath, outputFileName, (err) => {
                    if (err) console.error('Error downloading converted file:', err);
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(outputFilePath);
                });
            } else {
                console.error(`LibreOffice process exited with code ${code}`);
                res.status(500).send('File conversion failed.');
                fs.unlinkSync(inputFilePath);
                if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
            }
        });

    } catch (error) {
        console.error('Error during office conversion setup:', error);
        res.status(500).send('An error occurred during office conversion.');
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    }
});

// Helper function to parse page ranges like "1-3, 5, 7-9"
function parsePageRanges(ranges, maxPage) {
    const indices = new Set();
    const parts = ranges.split(',');

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(num => parseInt(num.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= maxPage) indices.add(i - 1);
                }
            }
        } else {
            const pageNum = parseInt(part.trim(), 10);
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= maxPage) {
                indices.add(pageNum - 1);
            }
        }
    }
    return Array.from(indices).sort((a, b) => a - b);
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

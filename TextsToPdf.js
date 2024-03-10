const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function convertHtmlToPdf(htmlFilePath, pdfFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file://' + path.resolve(htmlFilePath), {waitUntil: 'networkidle0'});
    await page.pdf({path: pdfFilePath, format: 'A4'});
    await browser.close();
}

const directoryPath = /* Insert Path to Local Directory containing text files here - output files will go to the same directory */;

const files = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.html');

async function convertFiles() {
    for (const file of files) {
        const htmlFilePath = path.join(directoryPath, file);
        const pdfFilePath = path.join(directoryPath, file.replace('.html', '.pdf'));
        await convertHtmlToPdf(htmlFilePath, pdfFilePath);
    }
}

convertFiles();

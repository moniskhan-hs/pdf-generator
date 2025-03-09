
import express, { json } from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import fs from 'fs';
import os from 'os';
import path from 'path';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4444;

// Render.com specific configuration
const isProduction = process.env.NODE_ENV === 'production';

app.get("/generatePdf", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let browser;
  let tempDir;

  try {
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ]
    };

    if (isProduction) {
      // For Render.com environment
      tempDir = path.join(os.tmpdir(), 'chromium');
      fs.mkdirSync(tempDir, { recursive: true });
      
      launchOptions.executablePath = '/usr/bin/chromium';
      launchOptions.env = {
        ...process.env,
        TMPDIR: tempDir
      };
    } else {
      // Local development configuration
      launchOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    console.log("Navigating to URL:", req.query.url);
    await page.goto(req.query.url, { waitUntil: "networkidle2" });

    // Login handling
    await page.type("#loginform-username", "handysolver.com");
    await page.type("#loginform-password", "y@123");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click("[type=submit]")
    ]);
    console.log("Clicked login.");

    await page.goto(req.query.url, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("Generating PDF...");

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: false
    });

    console.log("PDF generated, closing browser...");
    await browser.close();

    if (isProduction && tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`Cleaned up temp directory: ${tempDir}`);
    }

    res.status(200).json({
      type: "pdf",
      success: 'pdf generated successfully'
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (browser) await browser.close();
    if (isProduction && tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/myname", async(req,res)=>{


    res.status(200).json({
        result: `here is query value ${req.query.url}`
      });
})


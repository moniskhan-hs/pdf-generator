import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4444;

const isProduction = process.env.NODE_ENV === 'production';

app.get("/generatePdf", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let browser;

  try {
    const options = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ]
    };

    if (isProduction) {
      options.executablePath = '/usr/bin/chromium';
    }else{
      options.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }

    browser = await puppeteer.launch(options);
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

    await page.goto(req.query.url, { waitUntil: "networkidle2", timeout: 30000 });
    const pdfBuffer = await page.pdf({ printBackground: true });

    await browser.close();

    res.status(200).json({
      type: "pdf",
      success: 'pdf generated successfully'
    });
    console.log('pdf generated successfully:')

  } catch (error) {
    console.error("Error:", error);
    if (browser) await browser.close();
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


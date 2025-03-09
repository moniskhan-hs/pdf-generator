
import express, { json } from 'express'
import cors from 'cors'
import puppeteer from 'puppeteer-extra';
const app = express();
app.use(cors()); // Allow all origins
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
const PORT = 4444
import { executablePath } from 'puppeteer';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

const dynamic = 'force-dynamic'
const maxDuration = 100;

puppeteer.use(stealthPlugin());

console.log('process.env.NOD ', process.env.NODE_ENV === 'production')
app.get("/generatePdf", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    let browser;
    
    try {
      // Launch Puppeteer with desired options
      if(process.env.NODE_ENV === 'production'){
        const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
        browser = await puppeteerCore.launch({
            executablePath,
            // You can pass other configs as required
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport
        })
      }else{
        browser = await puppeteer.launch({
          args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage', // Prevents shared memory issues
              '--single-process'],
          headless: true,
          executablePath: 'C:\Program Files\Google\Chrome\Application\chrome.exe' ||  executablePath(),
        });
      }
  
      const page = await browser.newPage();
      console.log("Navigating to URL:", req.query.url);
      await page.goto(req.query.url, { waitUntil: "networkidle2" });
  
      // Login actions (adjust selectors as necessary)
      await page.type("#loginform-username", "rahul_matharu@handysolver.com");
      await page.type("#loginform-password", "Handy@123");
  
      // Wait for navigation after clicking the submit button
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2",}),
        page.click("[type=submit]")
      ]);
      console.log("Clicked login.");
  
      // Optionally, navigate again if needed (e.g., to refresh the page post-login)
      await page.goto(req.query.url, { waitUntil: "networkidle2" ,timeout:30000});
      console.log("Generating PDF...");
    
      const pdfBuffer = await page.pdf({
        printBackground: true,
        preferCSSPageSize: false
      });
      console.log("PDF generated, closing browser...");
      await browser.close();
      res.status(200).json({
        type: "pdf",
        // pdfBuffer: pdfBuffer,
        success:'pdf generated successfully'
    });
    console.log('pdf generated successfully')
    } catch (error) {
      console.error("PDF Generation Error:", error.message);
      if (browser) await browser.close();
      res.status(500).json({
        message: "Failed to generate PDF",
        error: error.message,
      });
    }
  });


app.get("/myname", async(req,res)=>{


    res.status(200).json({
        result: `here is query value ${req.query.url}`
      });
})

app.listen(PORT ,()=>{
    console.log("server is listening on port ", PORT)
}

 )
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import chromium from "@sparticuz/chromium";

import  stealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(stealthPlugin());
const app = express();
app.use(cors());
const PORT = process.env.PORT || 4444;

const isProduction = process.env.NODE_ENV === "production";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

app.get("/generatePdf", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let browser;

  try {
    const options = {
      args: chromium.args,
      executablePath: isProduction
        ? await chromium.executablePath()
        : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    };

    browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    console.log("Navigating to URL:", req.query.url);
    await page.goto(req.query.url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    // Login handling
    console.log("start login with crendentials.......");
    await page.type("#loginform-username", "rahul_matharu@handysolver.com");
    await page.type("#loginform-password", "Handy@123");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2",timeout: 120000, }),
      page.click("[type=submit]"),
    ]);
    console.log("login completed");
    console.log("Navigating with authentication:", req.query.url);

    await page.goto(req.query.url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    console.log("Navigating with authentication completed:", req.query.url);
    const pdfBuffer = await page.pdf({ printBackground: true });

    await browser.close();

    res.status(200).json({
      type: "pdf",
      success: "pdf generated successfully",
    });
    console.log("pdf genereted successfully");
  } catch (error) {
    console.error("Error:", error);
    if (browser) await browser.close();
    res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/myname", async (req, res) => {
  res.status(200).json({
    result: `here is query value ${req.query.url}`,
  });
});

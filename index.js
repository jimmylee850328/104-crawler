const express = require('express');
const cors = require('cors');
const chromium = require('chrome-aws-lambda');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/api/data', async (req, res) => {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath;

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // 設置 user agent 來模擬真實瀏覽器
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // 訪問目標網頁
    await page.goto('https://www.104.com.tw/jobs/search/?area=6001001000,6001002000&jobsource=index_s&keyword=vue%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%AB&mode=s&page=2&order=15&sctp=M&scmin=40000&scstrict=1&searchJobs=1', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 等待一下確保內容載入
    await page.waitForTimeout(2000);

    // 獲取職缺數量
    const jobCount = await page.evaluate(() => {
      const element = document.querySelector(".order__bar div");
      return element ? element.textContent.replace(/\D/g, "") : "0";
    });

    if (browser) {
      await browser.close();
    }
    
    res.json({ jobCount });
  } catch (error) {
    console.error('Error:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ error: error.message || '發生錯誤' });
  }
});

// 本地開發用
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// 為了 Vercel Serverless 環境
module.exports = app; 
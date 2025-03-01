const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/api/data', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // 訪問目標網頁
    await page.goto('https://www.104.com.tw/jobs/search/?area=6001001000,6001002000&jobsource=index_s&keyword=vue%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%AB&mode=s&page=2&order=15&sctp=M&scmin=40000&scstrict=1&searchJobs=1', {
      waitUntil: 'networkidle0'
    });

    // 獲取職缺數量
    const jobCount = await page.evaluate(() => {
      const element = document.querySelector(".order__bar div");
      return element ? element.textContent.replace(/\D/g, "") : "0";
    });

    await browser.close();
    res.json({ jobCount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '發生錯誤' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
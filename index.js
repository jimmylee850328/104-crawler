const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto('https://www.104.com.tw/jobs/search/?area=6001001000,6001002000&jobsource=index_s&keyword=vue%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%AB&mode=s&page=2&order=15&sctp=M&scmin=40000&scstrict=1&searchJobs=1', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    const jobCount = await page.evaluate(() => {
      const element = document.querySelector(".order__bar div");
      return element ? element.textContent.replace(/\D/g, "") : "0";
    });

    await browser.close();
    return res.json({ jobCount });
  } catch (error) {
    console.error(error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({ error: error.message || '發生錯誤' });
  }
}; 
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const target = process.env.URL || 'http://localhost:5173/';
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Screenshot navigation target:', target);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' });
  const page = await browser.newPage();

  try{
    const deviceName = process.env.MOBILE_DEVICE;
    if(deviceName){
      const devices = puppeteer.devices || require('puppeteer/DeviceDescriptors').devices;
      const dev = devices[deviceName] || devices['iPhone X'];
      if(dev){
        console.log('Emulating device:', deviceName);
        await page.emulate(dev);
      }
    }
  }catch(err){ console.warn('Mobile emulation not applied', err); }

  page.setDefaultNavigationTimeout(60000);

  try{
    await page.goto(target, { waitUntil: 'load', timeout: 60000 });

    const links = await page.$$eval('a', anchors =>
      anchors
        .filter(a => /(project-\d+)(?:\.html)?/i.test(a.getAttribute('href') || ''))
        .map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
    );

    console.log('Found project links:', links);

    for(let i=0;i<links.length;i++){
      const id = i+1;
      const selector = `a[href*="project-${id}"]`;
      console.log('\nClicking', selector);

      // Click, wait, then screenshot
      await Promise.all([
        page.click(selector).catch(e => console.error('click error', e)),
        page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(e => null),
      ]);

      const url = page.url();
      const title = await page.title();
      const file = path.join(outDir, `project-${id}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('Saved screenshot:', file);
      console.log('Page title:', title);
      console.log('Page URL:', url);

      // go back to the index for next link
      await page.goto(target, { waitUntil: 'load', timeout: 60000 });
    }

    console.log('\nScreenshot navigation completed');
  }catch(err){
    console.error('Screenshot navigation failed:', err);
    process.exitCode = 2;
  }finally{
    await browser.close();
  }

})();

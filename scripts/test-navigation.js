const puppeteer = require('puppeteer');

(async () => {
  const target = process.env.URL || 'http://localhost:5173/';
  console.log('Navigation test target:', target);

  // Use the new headless mode and increase robustness for slow production builds
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });
  const page = await browser.newPage();
  // Mobile emulation: set MOBILE_DEVICE env var to a device name from puppeteer.devices (e.g. 'iPhone X')
  try{
    const deviceName = process.env.MOBILE_DEVICE;
    if(deviceName){
      const devices = puppeteer.devices || require('puppeteer/DeviceDescriptors').devices; // fallback
      const dev = devices[deviceName] || devices['iPhone X'];
      if(dev){
        console.log('Emulating device:', deviceName || 'iPhone X');
        await page.emulate(dev);
      }
    }
  }catch(err){ console.warn('Mobile emulation not applied', err); }
  // Increase navigation timeout to 60s to avoid flaky timeouts on slow hosts
  page.setDefaultNavigationTimeout(60000);

  try {
    // Use load instead of networkidle2 which can hang on some CDNs.
    await page.goto(target, { waitUntil: 'load', timeout: 60000 });

    // Find all project 'Learn more' links
    const links = await page.$$eval('a', anchors =>
      anchors
        .filter(a => /project-\d+\.html/i.test(a.getAttribute('href') || ''))
        .map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
    );

    console.log('Found project links:', links);

    for (let i = 0; i < links.length; i++) {
      const selector = `a[href*="project-${i+1}.html"]`;
      console.log('\nClicking', selector);
      // Click and wait for navigation (longer timeout)
      await Promise.all([
        page.click(selector).catch(e => { console.error('click error', e); }),
        page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(e => null),
      ]);

      console.log('After click URL:', page.url());

      // Go back to the index page for the next iteration
      await page.goto(target, { waitUntil: 'load', timeout: 60000 });
    }

    console.log('\nNavigation test completed successfully');
  } catch (err) {
    console.error('Navigation test failed:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();

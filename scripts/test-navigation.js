const puppeteer = require('puppeteer');

(async () => {
  const target = process.env.URL || 'http://localhost:5173/';
  console.log('Navigation test target:', target);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(15000);

  try {
    await page.goto(target, { waitUntil: 'networkidle2' });

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
      const [response] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => null),
        page.click(selector).catch(e => { console.error('click error', e); })
      ]);

      console.log('After click URL:', page.url());

      // Go back to the index page for the next iteration
      await page.goto(target, { waitUntil: 'networkidle2' });
    }

    console.log('\nNavigation test completed successfully');
  } catch (err) {
    console.error('Navigation test failed:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();

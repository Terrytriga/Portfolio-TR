const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async ()=>{
  const target = process.env.URL || 'http://localhost:5173/';
  const outDir = path.resolve(__dirname, '..', 'logs');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'console.log');
  const stream = fs.createWriteStream(outFile, { flags: 'w' });

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const messages = [];
  page.on('console', msg => {
    try{
      const args = msg.args().map(a=>a.toString()).join(' ');
      const text = `[console:${msg.type()}] ${args}`;
      messages.push({type: 'console', level: msg.type(), text});
      stream.write(text + '\n');
    }catch(e){ /* ignore */ }
  });
  page.on('pageerror', err => {
    const text = `[pageerror] ${err && err.stack ? err.stack : String(err)}`;
    messages.push({type:'pageerror', text});
    stream.write(text + '\n');
  });
  page.on('requestfailed', req => {
    const text = `[requestfailed] ${req.method()} ${req.url()} ${req.failure() && req.failure().errorText}`;
    messages.push({type:'requestfailed', text});
    stream.write(text + '\n');
  });

  console.log('Collecting console logs for', target);
  stream.write('Collecting console logs for ' + target + '\n');

  try{
    await page.goto(target, { waitUntil: 'load', timeout: 60000 });
    // wait a bit for async logs
    await page.waitForTimeout(2000);

    // collect project links
    const links = await page.$$eval('a', anchors =>
      anchors
        .filter(a => /(project-\d+)(?:\.html)?/i.test(a.getAttribute('href') || ''))
        .map(a => a.getAttribute('href'))
    );

    for(let href of links){
      const resolved = new URL(href, target).toString();
      console.log('Visiting', resolved);
      stream.write('Visiting ' + resolved + '\n');
      await page.goto(resolved, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(1500);
    }

    // summary
    const counts = messages.reduce((acc,m)=>{ acc[m.level||m.type] = (acc[m.level||m.type]||0)+1; return acc; }, {});
    stream.write('\nSummary:\n');
    stream.write(JSON.stringify(counts, null, 2) + '\n');
    console.log('Done. Wrote logs to', outFile);
    console.log('Summary:', counts);
  }catch(err){
    console.error('Collector failed:', err);
    stream.write('Collector failed: ' + String(err) + '\n');
  }finally{
    await browser.close();
    stream.end();
  }

})();

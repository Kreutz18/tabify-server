const express = require('express');
const puppet = require('puppeteer');
const port = process.env.PORT || 5000;
const app = express();
const parser = require('body-parser');
app.use(parser.json());


app.get('/express_backend', async (req, res) => {
  const lyrics = await scrapeUG();
  res.json({lyrics: lyrics});
});

app.listen(port, () => console.log(`Listening on port ${port}`));


async function scrapeUG() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setJavaScriptEnabled(true);
  await page.goto('https://tabs.ultimate-guitar.com/tab/elvis-presley/cant-help-falling-in-love-chords-1086983')

  const lyrics = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("body > div.js-page.js-global-wrapper > div.fbcII > main > div.BDmSP > article.o2tA_.JJ8_m > section > article > section.P8ReX > div > section > code > pre > span > span"))
      .map(x => x.textContent);
  });

  await page.close();

  return await lyrics;
}
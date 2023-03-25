const express = require('express');
const PORT = process.env.PORT || 3001;
const puppeteer = require('puppeteer');

const app = express();

app.get('/api/chords', async (req, res) => {
  const lyrics = await scrapeUG(req.query.url);
  res.json({lyrics: lyrics});
});

app.get('/api/tabs', async (req, res) => {
  const lyrics = await scrapeUG(req.query.url);
  res.json({lyrics: lyrics});
})



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


async function scrapeUG(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const lyrics = await page.$$eval("body > div.js-page.js-global-wrapper > div.fbcII > main > div.BDmSP > article.o2tA_.JJ8_m > section:nth-child(2) > article > section.P8ReX", (lyrics) => {
    return lyrics.map(x => x.textContent);
  });

  await page.close();

  return await lyrics;
}
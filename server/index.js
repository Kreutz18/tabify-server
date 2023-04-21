const express = require('express');
const PORT = process.env.PORT || 3001;
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');


const app = express();

app.get('/api/chords', async (req, res) => {
  const lyrics = await scrapeUG(req.query.url);
  res.json({lyrics: lyrics});
});

app.get('/api/tabs', async (req, res) => {
  const tab = await scrapeUG(req.query.url);
  res.json({tab: tab});
});

app.get('/api/tabs/search', async (req, res) => {
  const tabs = await searchTabs(req.query.title);
  res.json({tabs: tabs});
});

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

  return lyrics;
}

 async function searchTabs(title) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let url = 'https://www.ultimate-guitar.com/search.php?search_type=title&value=';
  url += title;

  await page.goto(url, {waitUntil: 'load', timeout: 0});
  const tabs = await page.$$eval("body > div.js-page.js-global-wrapper > div.fbcII > main > div.BDmSP > div.XwpqK > section > article > div > div.LQUZJ", (tabList) => {
    return tabList.map(x => x.innerHTML);
  });

  let idx = 0;
  let newTabs = tabs.map((x) => {
    if (idx === 0) {
      idx++;
      return;
    }
    let tab = {
        href: null,
        songName: '',
        type: null,
        rating: 0
      };

      let TAB_TYPE = {
        OFFICIAL: 'Official',
        PRO: 'Pro',
        CHORDS: 'chords',
        TAB: 'tab',
        BASS: 'bass'
      };
      const document = new JSDOM(x).window.document
      let type = document.querySelector('.lIKMM.PdXKy').innerHTML;
      switch (type) {
        case TAB_TYPE.CHORDS:
          tab.type = type;
          break;
        case TAB_TYPE.TAB:
          tab.type = type;
          break;
        case TAB_TYPE.BASS:
          tab.type = type;
          break;
        case TAB_TYPE.OFFICIAL:
        case TAB_TYPE.PRO:
        default: return;
      }

      let aTag = document.querySelector('.aPPf7.HT3w5.lBssT');
      tab.href = aTag.href;
      tab.songName = aTag.textContent;

      let rating = document.querySelector('.djFV9');
      tab.rating = rating ? rating.textContent : null;

      return tab;
  });

  await page.close();
  return newTabs.filter((tab) => { return tab !== undefined; });
}
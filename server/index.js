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
  const lyrics = await scrapeUG(req.query.url);
  res.json({lyrics: lyrics});
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

  await page.goto(url);
  const tabs = await page.$$eval("body > div.js-page.js-global-wrapper > div.fbcII > main > div.BDmSP > div.XwpqK > section > article > div > div.LQUZJ", (tabList) => {
    return tabList.map(x => x.innerHTML);
  });

  await page.close();

    let newTabs = tabs.map((x) => {
      let tab = {
          href: null,
          songName: '',
          type: null,
          rating: 0
        };

        let TAB_TYPE = {
          OFFICIAL: 'Official',
          PRO: 'Pro',
          CHORDS: 'Chords',
          TAB: 'Tab',
          BASS: 'Bass'
        };
        const document = new JSDOM(x.innerHtml).window.document;
        let aTag = document.getElementsByClassName('aPPf7 jtEAE lBssT')[0];
        console.log(aTag);
        tab.href = aTag.href;
        tab.songName = aTag.innerText;

        let rating = document.getElementsByClassName('djFV9').innerText;
        tab.rating = rating;

        let type = document.getElementsByClassName('lIKMM PdXKy')[0];
        switch (type.innerText) {
          case TAB_TYPE.CHORDS:
            tab.type = type.innerText;
            break;
          case TAB_TYPE.TAB:
            tab.type = type.innerText;
            break;
          case TAB_TYPE.BASS:
            tab.type = type.innerText;
            break;
          case TAB_TYPE.OFFICIAL:
          case TAB_TYPE.PRO:
          default: return;
        }

        return tab;
    });

  return newTabs;
}




/**
  check lIKMM PdXKy for type of tab
  - remove offical/pro tabs
  - pull href from <a> tag (className = aPPf7 jtEAE lBssT)
  - pull innerText for songName (className = aPPf7 jtEAE lBssT) (innerText)
  pull rating from song (className = djFV9)
  pull type (tab/chords) (className = lIKMM PdXKy)
  - two separate lists
    6-string (chords/tabs)
    Bass tabs
  song name = className(aPPf7 HT3w5 lBssT) - innerText
 */
const puppeteer = require('puppeteer');

module.exports = {
  searchTabs: async (title) => {
    function evalTab(x) {
      console.log('1');
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
      
      let htmlTag = document.createElement("div");
      htmlTag.innerHTML = `${x.innerHTML}`;

      let aTag = document.getElementsByClassName('aPPf7 jtEAE lBssT')[0];
      tab.href = aTag.href;
      tab.songName = aTag.innerText;

      let rating = document.getElementsByClassName('djFV9')[0].innerText;
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
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let url = 'https://www.ultimate-guitar.com/search.php?search_type=title&value=';
    url += title;

    await page.goto(url);

    console.log('before');
    return new Promise(async (res, rej) => {
      await page.$$eval("body > div.js-page.js-global-wrapper > div.fbcII > main > div.BDmSP > div.XwpqK > section > article > div > div.LQUZJ", (tabList) => {
        return tabList.map((x) => evalTab(x));     
      });
      await page.close();
    });


    await page.close();
    return await tabs;
  }
}
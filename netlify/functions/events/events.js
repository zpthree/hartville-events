const chromium = require('chrome-aws-lambda');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const autoScroll = require('./lib/autoScroll');

module.exports = function(app) {
  app.get('/', async (req, res) => {
    // scrape facebook events
    const facebook = async function getFacebookEvents() {
      const source = 'https://www.facebook.com/events/search?q=hartville&filters=eyJycF9ldmVudHNfbG9jYXRpb246MCI6IntcIm5hbWVcIjpcImZpbHRlcl9ldmVudHNfbG9jYXRpb25cIixcImFyZ3NcIjpcIjEwNDA1ODk1OTYzMTM5MlwifSIsImZpbHRlcl9ldmVudHNfZGF0ZV9yYW5nZTowIjoie1wibmFtZVwiOlwiZmlsdGVyX2V2ZW50c19kYXRlXCIsXCJhcmdzXCI6XCIyMDIyLTA1LTA2fjIwMjItMDYtMDZcIn0ifQ%3D%3D';
      const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      });

      let facebookEvents = await browser.newPage();

      await facebookEvents.goto(source);

      await facebookEvents.waitForSelector('[href*="/events/"]');

      await autoScroll(facebookEvents);

      return await facebookEvents.evaluate(() => {
        const _pageLinks = [];
        document.querySelectorAll('[href*="/events/"]').forEach(element => {
          if (element.firstChild === element.querySelector('[role="article"]')) {
            const link = `${element.href}`;
            const dateTime = element.querySelector('.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.ht8s03o8.e9vueds3.j5wam9gi.lrazzd5p.oo9gr5id')?.innerText;
            console.log(element.querySelector('.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.ht8s03o8.e9vueds3.j5wam9gi.lrazzd5p.oo9gr5id'));
            const title = element.querySelector('object[type="nested/pressable"] a')?.innerText;
            const location = element.querySelector('.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.ht8s03o8.jq4qci2q.a3bd9o3v.lrazzd5p.m9osqain')?.innerText;
            const image = element.querySelector('img');

            _pageLinks.push({
              link,
              dateTime,
              title,
              location,
              image: {
                src: image.src,
                alt: image.alt,
                height: image.height,
                width: image.width,
              },
              source: {
                id: `facebook`,
                url: `https://www.facebook.com/events/search?q=hartville&filters=eyJycF9ldmVudHNfbG9jYXRpb246MCI6IntcIm5hbWVcIjpcImZpbHRlcl9ldmVudHNfbG9jYXRpb25cIixcImFyZ3NcIjpcIjEwNDA1ODk1OTYzMTM5MlwifSIsImZpbHRlcl9ldmVudHNfZGF0ZV9yYW5nZTowIjoie1wibmFtZVwiOlwiZmlsdGVyX2V2ZW50c19kYXRlXCIsXCJhcmdzXCI6XCIyMDIyLTA1LTA2fjIwMjItMDYtMDZcIn0ifQ%3D%3D`,
              },
            });
          }
        });

        return _pageLinks;
      });
    }

    // scrape hartvillemarketplace.com/events/ for events
    const hartvillemarketplace = async () => {
      const source = 'https://hartvillemarketplace.com/events/';
      const _events = [];
      const response = await fetch(source);
      const html = await response.text();
      const $ = cheerio.load(html);


      $('.single-event').each((i, el) => {
        const title = $(el).find('h5 > a').text().replace(/\s\s+/g, '');
        const image = $(el).find('img');
        const dateTime = $(el).find('.dates-times').text().replace(/\s\s+/g, '');
        const link = $(el).find('h5 > a').attr('href').replace(/\s\s+/g, '');

        _events.push({
          title,
          location: `Hartville MarketPlace`,
          link,
          dateTime: {
            date: dateTime.split('\n')[0],
            startTime: dateTime.split('\n')[1].split('-')[0].trim(),
            endTime: dateTime.split('\n')[1].split('-')[1].trim(),
          },
          image: {
            url: image.attr('src'),
            alt: image.attr('alt'),
            height: image.attr('height'),
            width: image.attr('width'),
          },
          source: {
            id: `hartvillemarketplace`,
            url: source,
          },
        });
      });

      return _events;
    };

    // scrape hartvillekitchen.com/events/ for events
    const hartvillekitchen = async () => {
      const source = 'https://hartvillekitchen.com/events/';
      const _events = [];
      const response = await fetch(source);
      const html = await response.text();
      const $ = cheerio.load(html);


      $('.event-listing').each((i, el) => {
        const title = $(el).find('.event-details h3').text().replace(/\s\s+/g, '');
        const image = $(el).find('img');
        const date = $(el).find('.event-details p:first-of-type').text().replace(/\s\s+/g, '');
        const time = $(el).find('.event-details p:last-of-type').text().replace(/\s\s+/g, '');
        const link = $(el).find('.event-details > a').attr('href').replace(/\s\s+/g, '');

        _events.push({
          title,
          location: `Hartville Kitchen`,
          link,
          dateTime: {
            date,
            startTime: time.split('-')[0].trim(),
            endTime: time.split('-')[1].trim(),
          },
          image: {
            url: image.attr('src'),
            alt: image.attr('alt'),
            height: image.attr('height'),
            width: image.attr('width'),
          },
          source: {
            id: `hartvillekitchen`,
            url: source,
          },
        });
      });

      return _events;
    };

    // scrape hartvillehardware.com/events/ for events
    const hartvillehardware = async () => {
      const source = 'https://hartvillehardware.com/events/';
      const _events = [];
      const response = await fetch(source);
      const html = await response.text();
      const $ = cheerio.load(html);


      $('section.o-fullwidth.no-padding-bot').each((i, el) => {
        const titleWrapper = $(el).find('h2');
        const title = $(titleWrapper).text().replace(/\s\s+/g, '');
        const image = $(el).find('img');
        const dateWrapper = $(titleWrapper).next();

        const dateTime = $(dateWrapper)?.text().replace(/\s\s+/g, '');

        const descriptionWrapper = $(dateWrapper).next();
        const description = $(descriptionWrapper).html();

        const link = $(descriptionWrapper).find('a')?.attr('href')?.replace(/\s\s+/g, '') || '';

        _events.push({
          title,
          description,
          location: `Hartville Hardware`,
          link,
          dateTime: {
            date: dateTime,
          },
          image: {
            url: image.attr('src'),
            alt: image.attr('alt'),
            height: image.attr('height'),
            width: image.attr('width'),
          },
          source: {
            id: `hartvillehardware`,
            url: source,
          },
        });
      });

      return _events;
    };

    const events = [
      ...await hartvillemarketplace(),
      ...await hartvillekitchen(),
      ...await hartvillehardware(),
      ...await facebook(),
    ];

    res.json({ events })
  })
}
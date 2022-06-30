const chromium = require('chrome-aws-lambda');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const autoScroll = require('../../lib/autoScroll');

export async function handler (event, context) {
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

  const events = [
    ...await hartvillemarketplace(),
  ];


  return {
    statusCode: 200,
    body: JSON.stringify({ events }),
  };
}

const Twit = require('twit');

const bot = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 30 * 1000
});

const screenshot = async (browser) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 544, height: 2048 }); //gets a 512x512 image
  await page.goto('https://nickolas1.github.io/mondrian/');
  const image = await page.waitForSelector('#mondrian-image');
  await image.screenshot({ path: '/tmp/img.jpg', quality: 95 });
  console.log('image saved');
  const titleEl = await page.$('.description-title');
  const text = await (await titleEl.getProperty('textContent')).jsonValue();
  console.log(`title found: ${text}`);
  // if (!process.env.IS_LOCAL) {
  //     const result = await sendTweet(text);
  //     console.log(`result: ${result}`);
  // }

  await browser.close();
};

const sendTweet = text => {
  return new Promise((resolve, reject) => {
      bot.postMediaChunked({ file_path: '/tmp/img.jpg' }, (err, data, resp) => {
          if (err) {
              console.log('ERROR:', err);
              reject('postMediaChunked error');
          } else {
              console.log('media_id_string', data.media_id_string)
              const params = {
                  status: text,
                  media_ids: data.media_id_string
              };
              postStatus(params, resolve, reject);
          }
      });
  })
};

const postStatus = (params, resolve, reject) => {
    bot.post('statuses/update', params, (err, data, resp) => {
      if (err) {
        console.log(err);
        reject('post status error');
      } else {
        console.log(`Image tweeted!`);
        resolve('ok');
      }
    });
};

module.exports = screenshot;

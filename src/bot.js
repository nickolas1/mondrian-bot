const Twit = require('twit');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const fs = require('fs');

const s3 = new AWS.S3();

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
  const titleText = await (await titleEl.getProperty('textContent')).jsonValue();
  console.log(`title found: ${titleText}`);
  const s3params = {
    Bucket: process.env.IMAGE_BUCKET,
    Key: titleText,
    Body: fs.readFileSync('/tmp/img.jpg')
  }
  await saveToS3(titleText);
  console.log(`put to S3: ${process.env.IMAGE_BUCKET}/${titleText}`);
  // if (process.env.IS_LOCAL) {
  //     const result = await sendTweet(text);
  //     console.log(`result: ${result}`);
  // }

  await browser.close();
};

const saveToS3 = async text => {
  let keys = text.match(/[0-9]+/g);
  let key = new Date().getTime();
  if (keys != null && keys.length > 0) {
    key = keys[0];
  }
  return await s3.putObject({
    Bucket: process.env.IMAGE_BUCKET,
    Key: key,
    Body: fs.readFileSync('/tmp/img.jpg')
  }).promise();
}

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

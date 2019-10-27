const Twitter = require('twitter');
const AWS = require('aws-sdk');
const fs = require('fs');
const tweetImage = require('./tweeter');

const s3 = new AWS.S3();

const screenshot = async browser => {
  // get screenshot with puppeteer
  const page = await browser.newPage();
  await page.setViewport({ width: 544, height: 2048 }); //gets a 512x512 image
  await page.goto('https://nickolas1.github.io/mondrian/');
  const image = await page.waitForSelector('#mondrian-image');
  await image.screenshot({ path: '/tmp/img.jpg', quality: 95 });
  console.log('image saved');
  const titleEl = await page.$('.description-title');
  const titleText = await (await titleEl.getProperty(
    'textContent'
  )).jsonValue();
  console.log(`title found: ${titleText}`);

  // store it in s3
  const keys = titleText.match(/[0-9]+/g);
  let key = new Date().getTime();
  if (keys != null && keys.length > 0) {
    key = keys[0];
  }
  await saveToS3(key);
  console.log(`put to S3: ${process.env.IMAGE_BUCKET}/${key}`);

  // tweet it out
  if (!process.env.IS_LOCAL) {
    await tweetImage('/tmp/img.jpg', titleText);
  }

  await browser.close();
};

const saveToS3 = key => {
  return s3
    .putObject({
      Bucket: process.env.IMAGE_BUCKET,
      Key: key,
      Body: fs.readFileSync('/tmp/img.jpg')
    })
    .promise();
};

module.exports = screenshot;

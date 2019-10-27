const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const screenshot = require('./bot');

module.exports.bot = async (event, context, callback) => {
  const executablePath = process.env.IS_LOCAL
    ? './node_modules/puppeteer/.local-chromium/mac-706915/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    : await chromium.executablePath;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath
  });

  await screenshot(browser);
};

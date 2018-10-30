const setup = require('./starter-kit/setup');
const screenshot = require("./bot");

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false; ///NICK do we want this?
  const browser = await setup.getBrowser();
  await screenshot(browser);
};

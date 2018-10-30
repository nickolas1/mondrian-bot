const express = require("express");
const app = express();
const CronJob = require("cron").CronJob;

const screenshot = require("./src/bot");

let cronTime;

if (process.env.NODE_ENV === "production") {
  cronTime = "00 00 */1 * * *"; // every 1 hour
} else {
  cronTime = "*/10 * * * * *"; // every 10 seconds
}

const job = new CronJob({
  cronTime,
  onTick: () => {
    screenshot();
  },
  start: false
});
job.start();

const port = process.env.port || 3030;
app.listen(port, () => console.log("app listening on port:", port));

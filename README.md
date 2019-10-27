# mondrian-bot

Code that runs as an AWS lambda function to periodically build up [Mondrianbot's](https://github.com/nickolas1/mondrian) œuvre.

## deploy

This uses [serverless](https://serverless.com) for deploying. Create a `$stage.env.json` file with the secrets in the template and then:

`npm run deploy:full` for full infra and code

`npm run deploy:code` for code changes only

`npm run invoke:local` to do that

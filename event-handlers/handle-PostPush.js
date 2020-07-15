const AWS = require('aws-sdk')
const exec = require('child_process').exec

async function run(context, args) {
  try {
    const STS = new AWS.STS({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    })
    const callerIdentity = await STS.getCallerIdentity().promise()
    const callerIdentityArray = callerIdentity.Arn.split('/')
    const username = callerIdentityArray[callerIdentityArray.length - 1]
    const amplifyEnv = context.exeInfo.localEnvInfo.envName

    const command = `curl -X POST -H 'Content-type: application/json' --data '{"text":"${username} pushed to amplify env: *${amplifyEnv}*"}' ${process.env.AMPLIFY_SLACK_WEBHOOK_URL}`
    exec(command, (err, stdout, stderr) => {
      if (stdout === 'ok') {
        return
      }
      if (stderr) {
        context.print.error(`\nNotify Slack Error: ${stdout}`)
      }
    })
  } catch (err) {
    context.print.error(`\nNotify Slack Error: ${stdout}`)
  }
}

module.exports = {
  run,
}

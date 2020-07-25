const AWS = require('aws-sdk')
const axios = require('axios')
const util = require('util')
const path = require('path')
const asyncFSReadFile = util.promisify(require('fs').readFile)

async function run(context, args) {
  try {
    const statusPath = path.join(__dirname, '..', 'log', 'status.json')
    const resourceStatus = await asyncFSReadFile(statusPath, 'utf-8')
    let parsedResourceStatus
    if (resourceStatus) {
      parsedResourceStatus = JSON.parse(resourceStatus)
    }
    if (!parsedResourceStatus || parsedResourceStatus.length === 0) {
      return
    }
    const STS = new AWS.STS({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    const callerIdentity = await STS.getCallerIdentity().promise()
    const callerIdentityArray = callerIdentity.Arn.split('/')
    const username = callerIdentityArray[callerIdentityArray.length - 1]
    const amplifyEnv = context.exeInfo.localEnvInfo.envName
    const slackPayload = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${username} pushed to amplify env: *${amplifyEnv}*`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          fields: parsedResourceStatus
        }
      ]
    }
    await axios
      .post(process.env.AMPLIFY_SLACK_WEBHOOK_URL, slackPayload)
      .catch((err) => {
        context.print.error(`\nNotify Slack Error: ${err.response.data}`)
      })
  } catch (err) {
    context.print.error(`\nNotify Slack Error: ${err}`)
  }
}

module.exports = {
  run
}

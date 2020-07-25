const AWS = require("aws-sdk")
const util = require("util")
const path = require("path")
const exec = util.promisify(require("child_process").exec)
const asyncFSReadFile = util.promisify(require("fs").readFile)

async function run(context, args) {
  try {
    const statusPath = path.join(__dirname, "..", "log", "status.json")
    const resourceStatus = await asyncFSReadFile(statusPath, "utf-8")
    if (!resourceStatus) {
      return
    } else {
      parsedResourceStatus = JSON.parse(resourceStatus)
      if (!parsedResourceStatus || parsedResourceStatus.length === 0) {
        return
      }
      let chunkedResources = []
      for (let i = 0; i < parsedResourceStatus.length; i += 10) {
        chunkedResources.push(parsedResourceStatus.slice(i, i + 10))
      }

      const STS = new AWS.STS({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      })
      const callerIdentity = await STS.getCallerIdentity().promise()
      const callerIdentityArray = callerIdentity.Arn.split("/")
      const username = callerIdentityArray[callerIdentityArray.length - 1]
      const amplifyEnv = context.exeInfo.localEnvInfo.envName
      const slackPayload = {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${username} pushed to amplify env: *${amplifyEnv}*`,
            },
          },
          {
            type: "divider",
          },
        ],
      }
      for (let j = 0; j < chunkedResources.length; j++) {
        slackPayload.blocks.push({
          type: "section",
          fields: chunkedResources[j],
        })
      }
      const command = `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(
        slackPayload
      )}' ${process.env.AMPLIFY_SLACK_WEBHOOK_URL}`
      const { stdout, stderr } = await exec(command)
      if (stdout && stdout === "ok") {
        return
      } else if (stderr && stdout) {
        return context.print.error(`\nNotify Slack Error: ${stdout}`)
      }
    }
  } catch (err) {
    context.print.error(`\nNotify Slack Error: ${err}`)
  }
}

module.exports = {
  run,
}

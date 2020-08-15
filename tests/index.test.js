const { expect, test } = require("@jest/globals")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

test("invalid webhook url", async () => {
  async function notifySlack() {
    const command = `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(
      { text: "hello" }
    )}' INVALID_WEBHOOK_URL`
    return await exec(command)
  }
  expect(notifySlack).rejects.toThrow(/Could not resolve host/)
})

test("invalid slack payload", async () => {
  async function notifySlack() {
    const command = `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(
      "INVALID PAYLOAD!"
    )}' ${process.env.AMPLIFY_SLACK_WEBHOOK_URL}`
    return await exec(command)
  }
  const { stdout } = await notifySlack()
  expect(stdout).toEqual("invalid_payload")
})

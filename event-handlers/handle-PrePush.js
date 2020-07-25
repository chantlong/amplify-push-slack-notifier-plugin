const eventName = 'PrePush'
const util = require('util')
const path = require('path')

const asyncFSWriteFile = util.promisify(require('fs').writeFile)
async function run(context, args) {
  try {
    const {
      resourcesToBeCreated,
      resourcesToBeUpdated,
      resourcesToBeDeleted
    } = await context.amplify.getResourceStatus()
    const FIELDS = []

    for (let i = 0; i < resourcesToBeCreated.length; i++) {
      FIELDS.push({
        type: 'plain_text',
        text: `[created] ${resourcesToBeCreated[i].category}`
      })
      FIELDS.push({
        type: 'plain_text',
        text: resourcesToBeCreated[i].resourceName
      })
    }
    for (let i = 0; i < resourcesToBeUpdated.length; i++) {
      FIELDS.push({
        type: 'plain_text',
        text: `[updated] ${resourcesToBeUpdated[i].category}`
      })
      FIELDS.push({
        type: 'plain_text',
        text: resourcesToBeUpdated[i].resourceName
      })
    }
    for (let i = 0; i < resourcesToBeDeleted.length; i++) {
      FIELDS.push({
        type: 'plain_text',
        text: `[deleted] ${resourcesToBeDeleted[i].category}`
      })
      FIELDS.push({
        type: 'plain_text',
        text: resourcesToBeDeleted[i].resourceName
      })
    }
    const statusPath = path.join(__dirname, '..', 'log', 'status.json')
    await asyncFSWriteFile(statusPath, JSON.stringify(FIELDS))
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  run
}

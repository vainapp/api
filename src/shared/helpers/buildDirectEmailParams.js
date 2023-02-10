const { readFile } = require('fs/promises')
const path = require('path')

const { noReply, help } = require('../constants/emails')

function getContent(filePath) {
  return readFile(filePath, 'utf-8')
}

async function buildDirectEmailParams({
  toAddress,
  sourceAddress = noReply,
  template,
  templateData,
  replyToAddresses = [help],
}) {
  const templateFolder = path.join(__dirname, '..', 'views', 'template')

  return {
    toAddresses: [toAddress],
    sourceAddress,
    template,
    templateData: {
      ...templateData,
      meta: await getContent(path.join(templateFolder, 'meta.html')),
      css: await getContent(path.join(templateFolder, 'css.html')),
      header: await getContent(path.join(templateFolder, 'header.html')),
      signature: await getContent(path.join(templateFolder, 'signature.html')),
      footer: await getContent(path.join(templateFolder, 'footer.html')),
      support_email: help,
    },
    replyToAddresses,
  }
}

module.exports = buildDirectEmailParams

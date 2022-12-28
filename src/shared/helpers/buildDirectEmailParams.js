import { readFile } from 'fs/promises'
import path from 'path'

import { noReply, help } from '../constants/emails'

function getContent(filePath) {
  return readFile(filePath, 'utf-8')
}

export default async function buildDirectEmailParams({
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
    },
    replyToAddresses,
  }
}

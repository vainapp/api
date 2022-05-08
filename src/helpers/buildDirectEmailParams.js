import { noReply, help } from '../constants/emails'

export default function buildDirectEmailParams({
  toAddress,
  sourceAddress = noReply,
  template,
  templateData,
  replyToAddresses = [help],
}) {
  return {
    toAddresses: [toAddress],
    sourceAddress,
    template,
    templateData,
    replyToAddresses,
  }
}

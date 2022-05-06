import AWS from '../../config/aws'

class SendEmailService {
  constructor({
    toAddresses,
    ccAddresses = [],
    sourceAddress,
    template,
    templateData,
    replyToAddresses,
  }) {
    this.toAddresses = toAddresses
    this.ccAddresses = ccAddresses
    this.sourceAddress = sourceAddress
    this.template = template
    this.templateData = templateData
    this.replyToAddresses = replyToAddresses
    this.client = new AWS.SES({ apiVersion: '2010-12-01' })
  }

  getParams() {
    return {
      Destination: {
        CcAddresses: this.ccAddresses,
        ToAddresses: this.toAddresses,
      },
      Source: this.sourceAddress,
      Template: this.template,
      TemplateData: JSON.stringify(this.templateData),
      ReplyToAddresses: this.replyToAddresses,
    }
  }

  async execute() {
    const params = this.getParams()

    await this.client.sendTemplatedEmail(params).promise()
  }
}

export default SendEmailService

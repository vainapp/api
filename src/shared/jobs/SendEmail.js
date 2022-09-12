import SendEmailService from '../services/SendEmailService'

class SendEmail {
  get key() {
    return 'SendEmail'
  }

  async handle({ data }) {
    const {
      toAddresses,
      ccAddresses,
      sourceAddress,
      template,
      templateData,
      replyToAddresses,
    } = data

    const sendEmailService = new SendEmailService({
      toAddresses,
      ccAddresses,
      sourceAddress,
      template,
      templateData,
      replyToAddresses,
    })

    await sendEmailService.execute()
  }
}

export default new SendEmail()

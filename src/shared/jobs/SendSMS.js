import SendSMSService from '../services/SendSMSService'

class SendSMS {
  get key() {
    return 'SendSMS'
  }

  async handle({ data }) {
    const { phone, message } = data

    const sendSMSService = new SendSMSService({ phone, message })

    await sendSMSService.execute()
  }
}

export default new SendSMS()
